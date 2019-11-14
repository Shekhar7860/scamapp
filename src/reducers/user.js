'use strict';

import * as type from './../constants/ActionTypes';

const initialState = {
  netStatus: false,
  ipAddress: '',
  lang: 'en',
  textAlign: 'left',
  flexDirection: 'row',
  phone : '',
  userId : '',
  emailId : '',
  code : '+91',
  emailPhone : '',
  loginFieldId : '',
  talentId : '',
  talentName : '',
  related1 : '',
  realted2: '',
  profilepic : '',
  userName : '',
  userBio : '',
  talentImage : '',
  isDisabled : false,
  isDisabled1 : false,
  isDisabled2 : false,
  isDisabled3 : false,
  price : 0,
  vipPrice: 0,
  fbEmail: '',
  orderRefresh: false,
  pendingArr:[],
  rejectArr:[],
  famcamUserName : '',
  famcamUserImage : '',
  token : '',
  forceRefresh: false,
  refreshRequests: false,
  savedCards: [],
  isOrderRecieved: 2
  };

const user = (state = initialState, action) => {
  switch(action.type) {
    case type.CHECK_INTERNET_CONNECTION:
    return {
      ...state,
      netStatus: action.netStatus
    }
    case type.SET_USER_IP_ADDRESS:
    return {
      ...state,
      ipAddress: action.ipAddress
    }
    case type.APP_LANG:
    return {
      ...state,
      lang: action.lang,
      textAlign: action.lang=='en'?'left':'right',
      flexDirection: action.lang=='en'?'row':'row-reverse',
    }
    case type.GET_PHONE :
    return {
      ...state,
      phone : action.phone,
    }
    case type.GET_USER_ID :
    return {
      ...state,
      userId : action.id,
    }
    case type.GET_USER_EMAIL :
    return {
      ...state,
      emailId : action.email,
    }
    case type.COUNTRY_CODE :
    return {
      ...state,
      code : action.countryCode,
    }
    case type.EMAIL_PHONE :
    return {
      ...state,
      emailPhone : action.emailPhone,
    }
    case type.GET_LOGIN_FIELD_ID :
    return {
      ...state,
      loginFieldId : action.userid,
    }
    case type.GET_TALENT_ID :
    return {
      ...state,
      talentId : action.talentId,
    }
    case type.GET_PROFILE_PIC :
    return {
      ...state,
      profilepic: action.avatarSource
    }
    case type.GET_USER_NAME :
    return {
      ...state,
      userName : action.name,
    }
    case type.GET_TALENT_PROFESSION :
    return {
      ...state,
      related1: action.related1,
      related2: action.related2
    }
    case type.GET_TALENT_NAME :
    return {
      ...state,
      talentName : action.name
    }
    case type.GET_TALENT_IMAGE :
    return {
      ...state,
      talentImage : action.profilepic
    }
    case type.FAMCAM_USER_NAME :
    return {
      ...state,
      famcamUserName: action.name,
    }
    case type.FAMCAM_USER_PHOTO :
    return {
      ...state,
      famcamUserImage: action.image,
    }
    case type.IS_DISABLED :
    return {
      ...state,
      isDisabled: action.bool
    }
    case type.IS_DISABLED1 :
    return {
      ...state,
      isDisabled1: action.isDisabled1
    }
    case type.IS_DISABLED2 :
    return {
      ...state,
      isDisabled2: action.isDisabled2
    }
    case type.IS_DISABLED3 :
    return {
      ...state,
      isDisabled3: action.isDisabled3
    }
    case type.GET_PRICE :
    return {
      ...state,
      price: action.price,
      vipPrice: action.vipPrice
    }
    case type.SET_VIP :
    return {
      ...state,
      talentVip: action.talentVip
    }
    case type.GET_TOKEN :
    return {
      ...state,
      token: action.token
    }
    case type.VIDEO_PLAY_PATH:
    return {
      ...state,
      playpath: action.playpath
    }
    case type.FACEBOOK_EMAIL:
    return {
      ...state,
      fbEmail: action.fbEmail
    }
    case type.ORDER_REFRESH:
    return {
      ...state,
      orderRefresh: action.orderRefresh
    }
    case type.PENDING_ARRAY:
    return {
      ...state,
      pendingArr: action.pendingArr
    }
    case type.REJECT_ARRAY:
    return {
      ...state,
      rejectArr: action.rejectArr
    }
    case type.TALENT_ORDER_PERSONAL:
    return {
      ...state,
      talentName: action.talentName,
      talentImage: action.talentImage
    }
    case type.REFRESH_HOME:
    return {
      ...state,
      forceRefresh: action.forceRefresh
    }
    case type.TALENT_PAYMENT_ZERO:
    return {
      ...state,
      orderFor: action.orderFor,
      orderMessage: action.orderMessage,
      orderPaid: action.orderPaid,
      paidOrdernumber: action.paidOrdernumber,
      paidVip: action.paidVip
    }
    case type.TALENT_PAYMENT_DETAILS:
    return {
      ...state,
      payPromoText: action.payPromoText,
      payUserId: action.payUserId,
      payTalentId: action.payTalentId,
      payName: action.payName,
      payEmail: action.payEmail,
      payInstructions: action.payInstructions,
      payAmount: action.payAmount,
      payVip: action.payVip,
      payShow: action.payShow
    }
    case type.SAVE_CARDS:
    return {
      ...state,
      savedCards: action.savedCards
    }
    case type.SET_EDIT_DATA:
    return {
      ...state,
      editName: action.editName,
      editPhone: action.editPhone,
      editPhoto: action.editPhoto,
      editEmail: action.editEmail,
      editCCA2: action.editCCA2,
      editCallingCode: action.editCallingCode
    }
    case type.IS_ORDER_RECIEVED:
    return {
      ...state,
      isOrderRecieved: action.isOrderRecieved
    }
    case type.CLEAR_ON_LOGOUT:
    return {
      ...state,
      phone : '',
      userId : '',
      emailId : '',
      code : '+91',
      emailPhone : '',
      loginFieldId : '',
      talentId : '',
      talentName : '',
      related1 : '',
      realted2: '',
      profilepic : '',
      userName : '',
      userBio : '',
      talentImage : '',
      isDisabled : false,
      isDisabled1 : false,
      isDisabled2 : false,
      isDisabled3 : false,
      price : 0,
      vipPrice: 0,
      fbEmail: '',
      orderRefresh: false,
      pendingArr:[],
      rejectArr:[],
      famcamUserName : '',
      famcamUserImage : '',
      token : '',
      forceRefresh: false,
      refreshRequests: false,
      savedCards: [],
      isOrderRecieved: 2
    }
    default :
    return state;
  }
}

export default user
