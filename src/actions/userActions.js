'use strict';

import * as type from './../constants/ActionTypes';
import axios from 'axios';
import Appurl from '../../config';

export const checkInternet = (netStatus)=> {
  return (dispatch, getState) => {
    dispatch(setUserIPAddress())
    dispatch(updateCheckInternet(netStatus))
  }
}
export const updateCheckInternet = (netStatus)=> {
  return {
    type: type.CHECK_INTERNET_CONNECTION,
    netStatus
  }
}
export const setUserIPAddress = ()=> {
  return (dispatch, getState) => {
    return axios.get(`https://api.ipify.org`)
    .then((response)=> {
      console.log(response.data)
      return dispatch(saveUserIPAddress(response.data))
    })
    .catch((error)=> {
      console.log(error)
    })
  }
}
export const saveUserIPAddress = (ipAddress)=> {
  return {
    type: type.SET_USER_IP_ADDRESS,
    ipAddress
  }
}
export function getCountry(val, code) {
  return {
    type : name.COUNTRY_NAME,
    val,
    code
  }
}
export function getPhone(phone) {
  return {
    type : type.GET_PHONE,
    phone
  }
}
export function getUserId(id) {
  console.log(id);
  return {
    type: type.GET_USER_ID,
    id
  }
}

export function getLoginUserId(userid) {
  return {
    type: type.GET_LOGIN_FIELD_ID,
    userid
  }
}

export function getEmail(email) {
  return {
    type: type.GET_USER_EMAIL,
    email
  }
}

export function getCountryCode(countryCode) {
  return {
    type : type.COUNTRY_CODE,
    countryCode
  }
}

export function getLoginField(emailPhone) {
  return {
    type : type.EMAIL_PHONE,
    emailPhone
  }
}

export const setLanguage = (lang)=> {
  return {
    type: type.APP_LANG,
    lang
  }
}

export function getTalentId(talentId) {
  return {
    type : type.GET_TALENT_ID,
    talentId,
  }
}

export function getImage(avatarSource) {
  return {
    type: type.GET_PROFILE_PIC,
    avatarSource
  }
}

export function getUserName(name) {
  console.log(name);
  return {
    type: type.GET_USER_NAME,
    name
  }
}

export function getTalentProfession(related1, related2) {
  return {
    type: type.GET_TALENT_PROFESSION,
    related1,
    related2
  }
}

export function setTalentName(name) {
  console.log(name);
  return {
    type: type.GET_TALENT_NAME,
    name
  }
}

export function setImageTalent(profilepic) {
  return {
    type: type.GET_TALENT_IMAGE,
    profilepic
  }
}

//proile getting details, saving here

export function updateUserName(name) {
  return {
    type: type.FAMCAM_USER_NAME,
    name
  }
}

export function updateUserImage(image) {
  return {
    type: type.FAMCAM_USER_PHOTO,
    image
  }
}

//over


//button disabling after one click
export function toggleButton(bool) {
  return {
    type: type.IS_DISABLED,
    bool
  }
}
export function toggleButton1(isDisabled1) {
  return {
    type: type.IS_DISABLED1,
    isDisabled1
  }
}export function toggleButton2(isDisabled2) {
  return {
    type: type.IS_DISABLED2,
    isDisabled2
  }
}export function toggleButton3(isDisabled3) {
  return {
    type: type.IS_DISABLED3,
    isDisabled3
  }
}
export function getPrice(price, vipPrice) {
  console.log(price);
  return {
    type: type.GET_PRICE,
    price,
    vipPrice
  }
}
export function setVip(talentVip) {
  return {
    type: type.SET_VIP,
    talentVip
  }
}

export function userToken(token) {
  return {
    type: type.GET_TOKEN,
    token
  }
}
export const setPlayVideo = (playpath)=> {
  return {
    type: type.VIDEO_PLAY_PATH,
    playpath
  }
}
export const setFacebookEmail = (fbEmail)=> {
  return {
    type: type.FACEBOOK_EMAIL,
    fbEmail
  }
}
export const setOrderRefresh = (orderRefresh)=> {
  return {
    type: type.ORDER_REFRESH,
    orderRefresh
  }
}
export const setPendingArray = (pendingArr)=> {
  return {
    type: type.PENDING_ARRAY,
    pendingArr
  }
}
export const setRejectArray = (rejectArr)=> {
  return {
    type: type.REJECT_ARRAY,
    rejectArr
  }
}
export const setTalentOrderDetails = (talentName, talentImage)=> {
  return {
    type: type.TALENT_ORDER_PERSONAL,
    talentName,
    talentImage
  }
}
export const setTalentPaymentDetails = (orderFor, orderMessage, orderPaid, paidOrdernumber, paidVip)=> {
  return {
    type: type.TALENT_PAYMENT_ZERO,
    orderFor,
    orderMessage,
    orderPaid,
    paidOrdernumber,
    paidVip
  }
}
export const setTalentPay = (payPromoText, payUserId, payTalentId, payName, payEmail, payInstructions, payAmount, payVip, payShow)=> {
  return {
    type: type.TALENT_PAYMENT_DETAILS,
    payPromoText,
    payUserId,
    payTalentId,
    payName,
    payEmail,
    payInstructions,
    payAmount,
    payVip,
    payShow
  }
}
export const forceRefreshHome = (forceRefresh)=> {
  return {
    type: type.REFRESH_HOME,
    forceRefresh
  }
}

export const setSavedCards = (savedCards)=> {
  return {
    type: type.SAVE_CARDS,
    savedCards
  }
}
export const setEditData = (editName, editPhone, editEmail, editPhoto, editCCA2, editCallingCode)=> {
  return {
    type: type.SET_EDIT_DATA,
    editName,
    editPhone,
    editPhoto,
    editEmail,
    editCCA2,
    editCallingCode
  }
}
export const setIsOrderRecieved = (isOrderRecieved)=> {
  return {
    type: type.IS_ORDER_RECIEVED,
    isOrderRecieved
  }
}
export const clearOnLogout = ()=> {
  return {
    type: type.CLEAR_ON_LOGOUT
  }
}
