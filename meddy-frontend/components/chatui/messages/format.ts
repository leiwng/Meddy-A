
import { CONFIG } from '@/config-global';

export function getContent(content) {
 if (Array.isArray(content)) {
  return content.reduce((acc, item) => {  
   if (item.type === 'text') {
    acc.contentString += item.text;
   } else if (item.type === 'image_url') {
    // const filename = item.image_url.split('/').pop()
    const filename = encodeURIComponent(item.image_url);
    const fileurl = `${CONFIG.serverUrl}/image?file_path=${filename}`
    acc.imgList.push(fileurl);
   }
   return acc;
  }
  , { contentString: '', imgList: [] });
 }
 return { contentString: content, imgList: [] };
}