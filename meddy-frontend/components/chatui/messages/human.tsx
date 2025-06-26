import ImgPreview from '@/components/img-preview/ImgPreview'
import { getContent } from './format'
import ImgList from './img-list'
import { useAuthContext } from '@/auth/hooks'
import { useRef } from 'react'
import { Popover } from 'antd'

function ProfileCard() {
  return (
    <div className='g-profile-card'>
      <div className='header'>
        <div className='avatar'>黎明</div>
        <div className='role'>专家</div>
      </div>
      <div className='infolist'>
        <div className='item'>
          <div className='desc'>职务</div>
          <div className='value'>某某医院妇儿个医生</div>
        </div>
        <div className='item'>
          <div className='desc'>所属医院</div>
          <div className='value'>华南医院附属儿科</div>
        </div>
        <div className='item'>
          <div className='desc'>城市</div>
          <div className='value'>成都</div>
        </div>
      </div>
    </div>
  )
}

export default function HumanMessage({ message }) {
  const { user } = useAuthContext()
  const { content, type: role } = message
  const { contentString, imgList } = getContent(message.content)
  // console.log('message', message)
  const container = useRef()

  let mestring = ''
  let mrole = ''
  if (user) {
    if (user.role === 'user') {
      if (
        message &&
        message.additional_kwargs &&
        message.additional_kwargs.uid
      ) {
        mestring =
          user.userId === message.additional_kwargs.uid ? 'me' : 'other'
        mrole = message.additional_kwargs.role
      } else {
        mestring = 'me'
        mrole = 'user'
      }
    } else {
      if (
        message &&
        message.additional_kwargs &&
        message.additional_kwargs.uid
      ) {
        mestring =
          user.userId === message.additional_kwargs.uid ? 'me' : 'other'
        mrole = message.additional_kwargs.role
      } else {
        mestring = 'other'
        mrole = 'user'
      }
    }
  }
  return (
    <div className='chat-item' data-role={mestring}>
      <div className='iconbox' ref={container}>
        <Popover
          content={<ProfileCard />}
          trigger='click'
          getPopupContainer={() => container.current}>
          {mrole === 'expert' ? (
            <svg
              viewBox='0 0 1024 1024'
              version='1.1'
              xmlns='http://www.w3.org/2000/svg'
              p-id='4635'
              width='24'
              height='24'>
              <path
                d='M737.960177 357.950519a41.912667 41.912667 0 0 1-15.527534-3.152206 572.067039 572.067039 0 0 0-421.461635 0 37.125983 37.125983 0 0 1-35.024513-2.568465 31.989055 31.989055 0 0 1-13.893056-26.268384v-245.171588A41.67917 41.67917 0 0 1 280.189797 44.014137a631.842207 631.842207 0 0 1 463.374302 0A41.562422 41.562422 0 0 1 770.532973 80.673127v245.171589a31.755558 31.755558 0 0 1-13.776308 26.268384 33.857029 33.857029 0 0 1-19.146733 5.72067z m-226.258352-100.403603a627.289021 627.289021 0 0 1 202.091438 33.156539V93.982442a570.782807 570.782807 0 0 0-404.066127 0V290.703455a629.273743 629.273743 0 0 1 201.974689-33.156539z m388.77209 765.869342H123.863722a49.384563 49.384563 0 0 1-35.725002-15.410785A56.622962 56.622962 0 0 1 72.377689 969.011515c-10.974347-119.900581 16.461521-217.03523 81.723863-288.368487a371.376582 371.376582 0 0 1 164.731957-100.637099 662.663778 662.663778 0 0 1 201.624444-28.953597c141.966024 0 262.800593 45.765363 340.088018 128.423212A336.819063 336.819063 0 0 1 933.980699 805.56379a427.065557 427.065557 0 0 1 17.97925 163.447725 56.622962 56.622962 0 0 1-15.877779 39.811196 49.384563 49.384563 0 0 1-35.608255 15.177289z m-770.539277-57.323452h764.818607v-0.817239c7.238399-101.33759-18.329495-184.228936-76.236689-246.339072-66.429826-71.450006-172.320602-110.794208-298.175351-110.794208-102.03808 0-240.968647 19.263482-324.326987 110.67746-53.937749 59.308175-76.353437 141.849276-66.663322 245.75533a3.969445 3.969445 0 0 1 0 1.517729z'
                fill='#444444'
                p-id='4636'></path>
              <path
                d='M510.534342 601.370881A214.466765 214.466765 0 0 1 408.61301 574.985748a274.942424 274.942424 0 0 1-81.723863-66.196328 324.210238 324.210238 0 0 1-53.704253-90.012998 280.196101 280.196101 0 0 1-19.847223-100.520351h57.206704a247.623304 247.623304 0 0 0 59.891916 153.524114c39.460951 46.69935 89.312507 72.383993 140.098051 72.383992 111.961692 0 202.208186-123.052788 202.208186-224.974119H770.532973A273.541443 273.541443 0 0 1 749.635014 420.294151a318.956561 318.956561 0 0 1-54.404743 89.662752 280.196101 280.196101 0 0 1-81.723862 65.729336 220.070687 220.070687 0 0 1-102.972067 26.151636z m91.647474 373.594801H531.198804L251.819942 769.138297l128.423213-144.067495z'
                fill='#444444'
                p-id='4637'></path>
              <path
                d='M510.884587 895.226542l74.135218 61.759891 186.563904-191.934329-100.753848-139.981302-159.945274 270.15574zM585.37005 128.306464h-45.064873V83.241592h-57.206704v45.064872h-45.064873v57.206704h45.064873v45.064873h57.206704v-45.064873h45.064873v-57.206704z'
                fill='#444444'
                p-id='4638'></path>
            </svg>
          ) : (
            <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
            />
          </svg>
          )}
        </Popover>
      </div>

      <div>
        <div
          className='chat-msg-content'
          style={{ visibility: content ? 'visible' : 'hidden' }}>
          <>{contentString}</>
          {imgList.length > 0 && <ImgList imgList={imgList} />}
        </div>
      </div>
    </div>
  )
}
