"use client";

import { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import { coerceMessageLikeToMessage, convertToChunk, isBaseMessageChunk, } from "@langchain/core/messages";
import { createClient } from "@/utils/util";

class StreamError extends Error {
    constructor(data) {
        super(data.message);
        this.name = data.name ?? data.error ?? "StreamError";
    }
    static isStructuredError(error) {
        return typeof error === "object" && error != null && "message" in error;
    }
}
function tryConvertToChunk(message) {
    try {
        return convertToChunk(message);
    }
    catch {
        return null;
    }
}
class MessageTupleManager {
    constructor() {
        Object.defineProperty(this, "chunks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        this.chunks = {};
    }
    add(serialized) {
        // TODO: this is sometimes sent from the API
        // figure out how to prevent this or move this to LC.js
        if (serialized.type.endsWith("MessageChunk")) {
            serialized.type = serialized.type
                .slice(0, -"MessageChunk".length)
                .toLowerCase();
        }
        const message = coerceMessageLikeToMessage(serialized);
        const chunk = tryConvertToChunk(message);
        console.log('chunk message', chunk, message);
        const id = (chunk ?? message).id;
        if (!id) {
            console.warn("No message ID found for chunk, ignoring in state", serialized);
            return null;
        }
        this.chunks[id] ??= {};
        if (chunk) {
            const prev = this.chunks[id].chunk;
            this.chunks[id].chunk =
                (isBaseMessageChunk(prev) ? prev : null)?.concat(chunk) ?? chunk;
        }
        else {
            this.chunks[id].chunk = message;
        }
        return id;
    }
    clear() {
        this.chunks = {};
    }
    get(id, defaultIndex) {
        if (this.chunks[id] == null)
            return null;
        this.chunks[id].index ??= defaultIndex;
        return this.chunks[id];
    }
}
const toMessageDict = (chunk) => {
    const { type, data } = chunk.toDict();
    return { ...data, type };
};
function unique(array) {
    return [...new Set(array)];
}
function findLastIndex(array, predicate) {
    for (let i = array.length - 1; i >= 0; i--) {
        if (predicate(array[i]))
            return i;
    }
    return -1;
}
function getBranchSequence(history) {
    const childrenMap = {};
    // First pass - collect nodes for each checkpoint
    history.forEach((state) => {
        const checkpointId = state.parent_checkpoint?.checkpoint_id ?? "$";
        childrenMap[checkpointId] ??= [];
        childrenMap[checkpointId].push(state);
    });
    const rootSequence = { type: "sequence", items: [] };
    const queue = [{ id: "$", sequence: rootSequence, path: [] }];
    const paths = [];
    const visited = new Set();
    while (queue.length > 0) {
        const task = queue.shift();
        if (visited.has(task.id))
            continue;
        visited.add(task.id);
        const children = childrenMap[task.id];
        if (children == null || children.length === 0)
            continue;
        // If we've encountered a fork (2+ children), push the fork
        // to the sequence and add a new sequence for each child
        let fork;
        if (children.length > 1) {
            fork = { type: "fork", items: [] };
            task.sequence.items.push(fork);
        }
        for (const value of children) {
            const id = value.checkpoint.checkpoint_id;
            let sequence = task.sequence;
            let path = task.path;
            if (fork != null) {
                sequence = { type: "sequence", items: [] };
                fork.items.unshift(sequence);
                path = path.slice();
                path.push(id);
                paths.push(path);
            }
            sequence.items.push({ type: "node", value, path });
            queue.push({ id, sequence, path });
        }
    }
    return { rootSequence, paths };
}
const PATH_SEP = ">";
const ROOT_ID = "$";
// Get flat view
function getBranchView(sequence, paths, branch) {
    const path = branch.split(PATH_SEP);
    const pathMap = {};
    for (const path of paths) {
        const parent = path.at(-2) ?? ROOT_ID;
        pathMap[parent] ??= [];
        pathMap[parent].unshift(path);
    }
    const history = [];
    const branchByCheckpoint = {};
    const forkStack = path.slice();
    const queue = [...sequence.items];
    while (queue.length > 0) {
        const item = queue.shift();
        if (item.type === "node") {
            history.push(item.value);
            branchByCheckpoint[item.value.checkpoint.checkpoint_id] = {
                branch: item.path.join(PATH_SEP),
                branchOptions: (item.path.length > 0
                    ? pathMap[item.path.at(-2) ?? ROOT_ID] ?? []
                    : []).map((p) => p.join(PATH_SEP)),
            };
        }
        if (item.type === "fork") {
            const forkId = forkStack.shift();
            const index = forkId != null
                ? item.items.findIndex((value) => {
                    const firstItem = value.items.at(0);
                    if (!firstItem || firstItem.type !== "node")
                        return false;
                    return firstItem.value.checkpoint.checkpoint_id === forkId;
                })
                : -1;
            const nextItems = item.items.at(index)?.items ?? [];
            queue.push(...nextItems);
        }
    }
    return { history, branchByCheckpoint };
}
function fetchHistory(client, threadId) {
    return client.threads.getHistory(threadId, { limit: 1000 });
}
function useThreadHistory(threadId, client, clearCallbackRef, submittingRef) {
    const [history, setHistory] = useState([]);
    const fetcher = useCallback((threadId) => {
        if (threadId != null) {
            return fetchHistory(client, threadId).then((history) => {
                setHistory(history);
                return history;
            });
        }
        setHistory([]);
        clearCallbackRef.current?.();
        return Promise.resolve([]);
    }, []);
    useEffect(() => {
        if (submittingRef.current)
            return;
        fetcher(threadId);
    }, [fetcher, submittingRef, threadId]);
    return {
        data: history,
        mutate: (mutateId) => fetcher(mutateId ?? threadId),
    };
}
const useControllableThreadId = (options) => {
    const [localThreadId, _setLocalThreadId] = useState(options?.threadId ?? null);
    const onThreadIdRef = useRef(options?.onThreadId);
    onThreadIdRef.current = options?.onThreadId;
    const onThreadId = useCallback((threadId) => {
        _setLocalThreadId(threadId);
        onThreadIdRef.current?.(threadId);
    }, []);
    if (!options || !("threadId" in options)) {
        return [localThreadId, onThreadId];
    }
    return [options.threadId ?? null, onThreadId];
};
export function useStream(options) {
    let { assistantId, messagesKey, onError, onFinish } = options;
    messagesKey ??= "messages";
    const client = useMemo(() => createClient(), []);
    const [threadId, onThreadId] = useControllableThreadId(options);
    const [branch, setBranch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [streamError, setStreamError] = useState(undefined);
    const [streamValues, setStreamValues] = useState(null);
    const messageManagerRef = useRef(new MessageTupleManager());
    const submittingRef = useRef(false);
    const abortRef = useRef(null);
    const trackStreamModeRef = useRef([]);
    const trackStreamMode = useCallback((...mode) => {
        for (const m of mode) {
            if (!trackStreamModeRef.current.includes(m)) {
                trackStreamModeRef.current.push(m);
            }
        }
    }, []);
    const hasUpdateListener = options.onUpdateEvent != null;
    const hasCustomListener = options.onCustomEvent != null;
    const callbackStreamMode = useMemo(() => {
        const modes = [];
        if (hasUpdateListener)
            modes.push("updates");
        if (hasCustomListener)
            modes.push("custom");
        return modes;
    }, [hasUpdateListener, hasCustomListener]);
    const clearCallbackRef = useRef(null);
    clearCallbackRef.current = () => {
        setStreamError(undefined);
        setStreamValues(null);
    };
    // TODO: this should be done on the server to avoid pagination
    // TODO: should we permit adapter? SWR / React Query?
    const history = useThreadHistory(threadId, client, clearCallbackRef, submittingRef);
    const getMessages = useMemo(() => {
        return (value) => Array.isArray(value[messagesKey])
            ? value[messagesKey]
            : [];
    }, [messagesKey]);
    const { rootSequence, paths } = getBranchSequence(history.data);
    const { history: flatHistory, branchByCheckpoint } = getBranchView(rootSequence, paths, branch);
    console.log('flatHistory',flatHistory)
    const threadHead = flatHistory.at(-1);
    const historyValues = threadHead?.values ?? {};
    const historyError = (() => {
        const error = threadHead?.tasks?.at(-1)?.error;
        if (error == null)
            return undefined;
        try {
            const parsed = JSON.parse(error);
            if (StreamError.isStructuredError(parsed)) {
                return new StreamError(parsed);
            }
            return parsed;
        }
        catch {
            // do nothing
        }
        return error;
    })();
    const messageMetadata = (() => {
        const alreadyShown = new Set();
        return getMessages(historyValues).map((message, idx) => {
            const messageId = message.id ?? idx;
            const firstSeenIdx = findLastIndex(history.data, (state) => getMessages(state.values)
                .map((m, idx) => m.id ?? idx)
                .includes(messageId));
            const firstSeen = history.data[firstSeenIdx];
            let branch = firstSeen
                ? branchByCheckpoint[firstSeen.checkpoint.checkpoint_id]
                : undefined;
            if (!branch?.branch?.length)
                branch = undefined;
            // serialize branches
            const optionsShown = branch?.branchOptions?.flat(2).join(",");
            if (optionsShown) {
                if (alreadyShown.has(optionsShown))
                    branch = undefined;
                alreadyShown.add(optionsShown);
            }
            return {
                messageId: messageId.toString(),
                firstSeenState: firstSeen,
                branch: branch?.branch,
                branchOptions: branch?.branchOptions,
            };
        });
    })();
    const stop = useCallback(() => {
        if (abortRef.current != null)
            abortRef.current.abort();
        abortRef.current = null;
    }, []);
    const submit = async (values, submitOptions) => {
        try {
            setIsLoading(true);
            setStreamError(undefined);
            submittingRef.current = true;
            abortRef.current = new AbortController();
            // Unbranch things
            const newPath = submitOptions?.checkpoint?.checkpoint_id
                ? branchByCheckpoint[submitOptions?.checkpoint?.checkpoint_id]?.branch
                : undefined;
            if (newPath != null)
                setBranch(newPath ?? "");
            // Assumption: we're setting the initial value
            // Used for instant feedback
            setStreamValues(() => {
                const values = { ...historyValues };
                if (submitOptions?.optimisticValues != null) {
                    return {
                        ...values,
                        ...(typeof submitOptions.optimisticValues === "function"
                            ? submitOptions.optimisticValues(values)
                            : submitOptions.optimisticValues),
                    };
                }
                return values;
            });
            let usableThreadId = threadId;
            if (!usableThreadId) {
                const thread = await client.threads.create({
                  metadata: {
                    user_id: submitOptions.userId,
                    title: submitOptions.inputTitle,
                  },
                });
                onThreadId(thread.thread_id);
                usableThreadId = thread.thread_id;
            }
            const streamMode = unique([
                ...(submitOptions?.streamMode ?? []),
                ...trackStreamModeRef.current,
                ...callbackStreamMode,
            ]);
            const checkpoint = submitOptions?.checkpoint ?? threadHead?.checkpoint ?? undefined;
            // @ts-expect-error
            if (checkpoint != null)
                delete checkpoint.thread_id;
            const run = client.runs.stream(usableThreadId, assistantId, {
                input: values,
                config: submitOptions?.config,
                command: submitOptions?.command,
                interruptBefore: submitOptions?.interruptBefore,
                interruptAfter: submitOptions?.interruptAfter,
                metadata: submitOptions?.metadata,
                multitaskStrategy: submitOptions?.multitaskStrategy,
                onCompletion: submitOptions?.onCompletion,
                onDisconnect: submitOptions?.onDisconnect ?? "cancel",
                signal: abortRef.current.signal,
                checkpoint,
                streamMode,
            });
            let streamError;
            for await (const { event, data } of run) {
                console.log('event event', event, data)
                if (event === "error") {
                    streamError = new StreamError(data);
                    break;
                }
                if (event === "updates")
                    options.onUpdateEvent?.(data);
                if (event === "custom")
                    options.onCustomEvent?.(data, {
                        mutate: (update) => setStreamValues((prev) => {
                            // should not happen
                            if (prev == null)
                                return prev;
                            return {
                                ...prev,
                                ...(typeof update === "function" ? update(prev) : update),
                            };
                        }),
                    });
                if (event === "metadata")
                    options.onMetadataEvent?.(data);
                if (event === "values")
                    setStreamValues(data);
                if (event === "messages") {
                    const [serialized] = data;
                    const messageId = messageManagerRef.current.add(serialized);
                    if (!messageId) {
                        console.warn("Failed to add message to manager, no message ID found");
                        continue;
                    }
                    setStreamValues((streamValues) => {
                        const values = { ...historyValues, ...streamValues };
                        // Assumption: we're concatenating the message
                        const messages = getMessages(values).slice();
                        const { chunk, index } = messageManagerRef.current.get(messageId, messages.length) ?? {};
                        if (!chunk || index == null)
                            return values;
                        messages[index] = toMessageDict(chunk);
                        return { ...values, [messagesKey]: messages };
                    });
                }
            }
            // TODO: stream created checkpoints to avoid an unnecessary network request
            const result = await history.mutate(usableThreadId);
            setStreamValues(null);
            if (streamError != null)
                throw streamError;
            const lastHead = result.at(0);
            console.log('result',result, lastHead)
            if (lastHead)
                onFinish?.(lastHead);
        }
        catch (error) {
            if (!(error instanceof Error &&
                (error.name === "AbortError" || error.name === "TimeoutError"))) {
                console.error(error);
                setStreamError(error);
                onError?.(error);
            }
        }
        finally {
            setIsLoading(false);
            // Assumption: messages are already handled, we can clear the manager
            messageManagerRef.current.clear();
            submittingRef.current = false;
            abortRef.current = null;
        }
    };
    const error = streamError ?? historyError;
    console.log('historyValues', historyValues);
    console.log('streamValues', streamValues);
    const values = streamValues ?? historyValues;
    return {
        get values() {
            trackStreamMode("values");
            return values;
        },
        client,
        assistantId,
        error,
        isLoading,
        stop,
        submit,
        branch,
        setBranch,
        history: flatHistory,
        experimental_branchTree: rootSequence,
        get interrupt() {
            // Don't show the interrupt if the stream is loading
            if (isLoading)
                return undefined;
            const interrupts = threadHead?.tasks?.at(-1)?.interrupts;
            if (interrupts == null || interrupts.length === 0) {
                // check if there's a next task present
                const next = threadHead?.next ?? [];
                if (!next.length || error != null)
                    return undefined;
                return { when: "breakpoint" };
            }
            // Return only the current interrupt
            return interrupts.at(-1);
        },
        get messages() {
            trackStreamMode("messages-tuple", "values");
            return getMessages(values);
        },
        getMessagesMetadata(message, index) {
            trackStreamMode("messages-tuple", "values");
            return messageMetadata?.find((m) => m.messageId === (message.id ?? index));
        },
    };
}
