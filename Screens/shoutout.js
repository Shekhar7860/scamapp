import React, { Component } from 'react';
import {   Text, View, Dimensions, Image, TouchableOpacity, Alert, TextInput, ScrollView, SafeAreaView,NetInfo } from 'react-native';

import { Navigation } from 'react-native-navigation';
import { MKTextField } from 'react-native-material-kit';
import CheckBox from 'react-native-check-box';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import KeepAwake from 'react-native-keep-awake';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { strings } from '../locales/i18n';
import Appurl from './../config';
import LinearGradient from 'react-native-linear-gradient';
import Validation from './../src/utils/Validation.js';
import ValidationAr from './../src/utils/ValidationAr.js';

import * as userActions from '../src/actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class shoutout extends Component {
  static navigatorStyle = {
    navBarHidden : true,
    tabBarHidden : true
  }
  constructor(props) {
    super(props);
    this.state = {
      name : '',
      email : this.props.user.loginFieldId.email,
      instructions : '',
      charCount: 0,
      promoText: '',
      promo : 0,
      promoApplied : false,
      orderid: '',
      promoPrice: 0,
      checkbox1: true,
      checkbox2: false
    }
  }

  componentDidMount() {
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      if(connectionInfo.type=='none' || connectionInfo.type=='unknown') {
        this.props.actions.checkInternet(false);
      }
      else {
        this.props.actions.checkInternet(true);
      }
    });
    NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);
  }
  componentWillUnmount() {
     let {actions} = this.props;
    actions.toggleButton(false);
    actions.toggleButton1(false);
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  validationRules= () => {
    return [
      {
        field: this.state.name,
        name: 'Full name',
        rules: 'required|min:2|max:30'
      },
      {
        field: this.state.email,
        name: 'Email Id',
        rules: 'required|email|max:100|no_space'
      },
      {
        field: this.state.instructions,
        name : 'Instructions',
        rules : 'required|min:2|max:350'
      },
      {
        field : this.state.promoText,
        name : 'Promo Code',
        rules : 'no_space'
      }
    ]
  }
  validationArRules= () => {
    return [
      {
        field: this.state.name,
        name: 'الإسم الكامل',
        rules: 'required|min:2|max:30'
      },
      {
        field: this.state.email,
        name: 'البريد الإلكتروني',
        rules: 'required|email|max:100|no_space'
      },
      {
        field: this.state.instructions,
        name : 'الرسالة',
        rules : 'required|min:2|max:350'
      },
      {
        field : this.state.promoText,
        name : 'كود الخصم',
        rules : 'no_space'
      }
    ]
  }
  back = () => {
    this.props.navigator.pop()
  }
  sendRequest = () => {
    let {actions} = this.props;
    let {visible} = this.state;
    let {name, email, instructions, promo, promoText, promoApplied} = this.state;
    let validaton= this.props.user.lang=='en'?Validation.validate(this.validationRules()):ValidationAr.validate(this.validationArRules())
    if(validaton.length != 0) {
      return Alert.alert(
        '',
        validaton[0],
        [
          {
            text: strings('globalValues.AlertOKBtn'),
            onPress: ()=> {

            }
          }
        ],
        { cancelable: false }
      );
    }
    else if(!this.props.user.netStatus) {
      return Alert.alert(
        '',
        strings('globalValues.NetAlert'),
        [
          {
            text: strings('globalValues.AlertOKBtn'),
            onPress: ()=> {
              this.setState({isDisabled: false, visible: false});
            }
          }
        ],
        { cancelable: false }
      );
    }
    else {
      this.props.actions.toggleButton1(true)
      this.setState({visible: true});
      KeepAwake.activate();
      if(this.promoVip()==0) {
        let {name, email, instructions, promo, promoText, promoApplied} = this.state;
        this.setState({visible: true})
        let values = {'promocode': this.state.promoText, 'userId' : this.props.user.loginFieldId.id, 'talentId' : this.props.user.talentId, 'forWhome' : name, 'foremail': email, 'message': instructions, 'ammount' : this.promoVip(), 'isVip' : this.state.checkbox2, 'isShow' : this.state.checkbox1};
        return axios.post(`${Appurl.apiUrl}paymentIfAmountZeero`, values)
        .then((response) => {
          let payPrice=this.promoVip()
          this.props.actions.setTalentPaymentDetails(name, instructions, payPrice, response.data.orderNumber, this.state.checkbox2)
          KeepAwake.deactivate();
          this.setState({visible: false})
          setTimeout(()=> {
            this.props.navigator.push({
              screen: 'AfterPayment'
            })
          }, 1000)
        }).catch((error) => {
          this.props.actions.toggleButton1(false)
          return this.showErrorAlert(error.response);
        })
      }
      else {
        this.setState({visible: true});
        let payPrice=this.promoVip()
        let { loginFieldId, talentId, lang, ipAddress } = this.props.user;
        this.props.actions.setTalentPay(this.state.promoText, loginFieldId.id, talentId, name, email, instructions, payPrice, this.state.checkbox2, this.state.checkbox1)
        let data = '?userId='+loginFieldId.id+'&talentId='+talentId+'&forWhome='+name+'&foremail='+email+'&message='+instructions+'&ammount='+payPrice+'&isVip='+this.state.checkbox2+'&isShow='+this.state.checkbox1+'&lang='+lang+'&customer_ip='+ipAddress
        this.setState({visible: false});
        this.props.navigator.push({
          screen: 'paymentWeb',
          passProps: {'paymentData': data}
        })
      }
    }
  }
  showErrorAlert = (response) => {
    Alert.alert(
      '',
      response.data.msg,
      [
        {
          text: strings('globalValues.AlertOKBtn'),
          onPress: () => {
            this.setState({visible: false});
            KeepAwake.deactivate();
          }
        }
      ],
      { cancelable: false }
    );
  }
  applyPromo = () => {
    let {promoText, promoApplied} = this.state;
    if(!promoApplied) {
      if(promoText == '') {
        Alert.alert(
          '',
          strings('shoutout.PromoEnter'),
          [
            {
              text: strings('globalValues.AlertOKBtn'),
            }
          ],
          { cancelable: false }
        );
      }
      else {
        let values = {'userId' : this.props.user.loginFieldId.id,'promocode' : promoText}
        return axios.post(`${Appurl.apiUrl}getPromo`, values)
        .then((response) => {
          return this.checkPromo(response);
        }).catch((error) => {
          return this.showErrorAlert(error.response);
        })
      }
    }
    else {
      this.setState({promo: 0, promoApplied: false})
      this.setState({promoText: ''})
    }
  }
  checkPromo=(response)=> {
    this.setState({promo:response.data.msg})
    if(response.data.success==2) {
      Alert.alert(
        '',
        strings('shoutout.PromoSuccess'),
        [
          {
            text: strings('globalValues.AlertOKBtn'),
            onPress: () => {
              this.setState({promoApplied: true});
              this.promoPriceCalci()
            }
          }
        ],
        { cancelable: false }
      );
    }
    else {
      Alert.alert(
        '',
        response.data.msg,
        [
          {
            text: strings('globalValues.AlertOKBtn'),
            onPress: () => {
            }
          }
        ],
        { cancelable: false }
      );
    }
  }
  promoPriceCalci = ()=> {
    let promoCalci = ((this.props.user.price*this.state.promo)/100);
    let dfr = promoCalci%1
    if(dfr!=0) {
      this.setState({promoPrice:promoCalci.toFixed(2)})
    }
    else {
      this.setState({promoPrice:promoCalci})
    }
  }
  promoVip = ()=> {
    if(this.state.promoApplied) {
      if(this.state.checkbox2) {
          return (this.props.user.price+this.props.user.vipPrice)-this.state.promoPrice
      }
      else {
        return this.props.user.price-this.state.promoPrice
      }
    }
    else if (this.state.checkbox2) {
      return this.props.user.price+this.props.user.vipPrice
    }
    else {
      return this.props.user.price
    }
  }
  render() {
    let { name, email, instructions, promo, promoText, promoApplied, visible, charCount, checkbox1, checkbox2 } = this.state;
    let { flexDirection, textAlign, lang, talentName, loginFieldId, talentVip, isDisabled1 } = this.props.user;
    const windowHeight = Dimensions.get('window').height;
    return (
      <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
        <SafeAreaView style = {{height:windowHeight, backgroundColor: 'white'}}>
          <Spinner visible={visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
          <View style={{flex: 0.1, marginHorizontal: 24, justifyContent: 'center'}}>
            <TouchableOpacity hitSlop = {{top:7, left:7, bottom:7, right:7}} style={{height: 20, width:24, justifyContent: 'center'}} onPress={() => {this.back()}}>
              <Image source={require('./../Images/ic_cancell.png')} style={{tintColor: '#000000',height: 14, width:18}}/>
            </TouchableOpacity>
          </View>
          <View style={{flex:0.1, justifyContent: 'flex-start', marginHorizontal: 24}}>
            <Text style = {{textAlign: textAlign, color: '#4A4A4A', fontSize: 20, fontFamily: lang=='en'?'SFUIDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('shoutout.text')}</Text>
            <Text style = {{textAlign: textAlign, color: '#4A4A4A', fontSize: 20, fontFamily: lang=='en'?'SFUIDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{talentName}</Text>
          </View>
          <View style = {{flex:0.1, marginHorizontal: 24}}>
            <MKTextField
              placeholder = {strings('shoutout.input1')}
              ref="name"
              placeholderTextColor='#AAAFB9'
              floatingLabelEnabled
              keyboardType = "default"
              returnKeyType = "next"
              textInputStyle = {{fontSize: 16, color: '#474D57', textAlign: textAlign}}
              style = {{marginTop:10}}
              underlineSize={1}
              highlightColor='#474D57'
              tintColor='#C2567A'
              autoCorrect={false}
              autoCapitalize= 'words'
              onChangeText = {(text) => {this.setState({name:text})}}
              onSubmitEditing = {(event) => {this.refs.Third.focus()}}
            />
          </View>
          <View style = {{flex:0.1, marginHorizontal: 24, marginTop: 5}}>
            <MKTextField
              placeholder = {strings('shoutout.input2')}
              ref="Second"
              editable={false}
              value={loginFieldId.email}
              placeholderTextColor='#AAAFB9'
              floatingLabelEnabled
              textInputStyle = {{fontSize: 16, color: '#474D57', textAlign: textAlign}}
              style = {{marginTop:10}}
              underlineSize={1}
              highlightColor='#474D57'
              tintColor='#C2567A'
            />
          </View>
          <View style = {{flex: 0.24, marginHorizontal: 24, marginTop: 10, borderWidth:1, borderColor: '#C2567A'}}>
            <Text style={{color: '#AAAFB9',textAlign: lang=='en'?'right':'left', paddingStart: lang=='en'?null:10, paddingEnd: lang=='en'?10:null, fontSize: 13, paddingTop: 5}}>{charCount}/350</Text>
            <TextInput
              placeholder={strings('shoutout.input3')}
              ref="Third"
              multiline = {true}
              maxLength={350}
              placeholderTextColor='#AAAFB9'
              underlineColorAndroid='transparent'
              keyboardType = "default"
              returnKeyType = "done"
              style = {{paddingTop:-5, marginBottom: 10, paddingLeft: lang=='en'?5:null, paddingRight: lang=='ar'?5:null,fontSize: 16, color: '#474D57', textAlign: textAlign}}
              autoCorrect={false}
              autoCapitalize= 'none'
              onChangeText = {(text) => this.setState({charCount: text.length, instructions: text})}
            />
          </View>
          <View style = {{flex:0.1, marginHorizontal: 24, flexDirection: flexDirection}}>
            <View style = {{flex: 0.75}}>
              <MKTextField
                placeholder = {strings('shoutout.input4')}
                placeholderTextColor='#AAAFB9'
                value={promoText}
                editable={!promoApplied}
                floatingLabelEnabled
                keyboardType = "default"
                returnKeyType = "done"
                textInputStyle = {{fontSize: 16, color: '#474D57', textAlign: textAlign}}
                style = {{marginTop:10}}
                underlineSize={1}
                highlightColor='#474D57'
                tintColor='#C2567A'
                autoCorrect={false}
                autoCapitalize= 'none'
                onChangeText = {(text) => {this.setState({promoText:text.trim()})}}
              />
            </View>
            <View style={{flex: 0.25, justifyContent: 'center'}}>
              <TouchableOpacity style={{height: 33}} onPress = {() => {this.applyPromo()}}>
                <LinearGradient colors={['#8D3F7D', '#D8546E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{flex: 1, borderRadius: 2, justifyContent: 'center'}}>
                  <Text style = {{backgroundColor: 'transparent',textAlign:'center', padding: 7, color: 'white', fontFamily: lang=='en'?'SFUIText-Medium':'HelveticaNeueLTArabic-Roman'}}>{promoApplied?strings('shoutout.RemoveLabel'):strings('shoutout.ApplyLabel')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{flex: 0.16, marginHorizontal: 24}}>
            <View style={{flex: 0.35, flexDirection: flexDirection, alignItems: 'center'}}>
              <View style={{flex: 0.1}}>
                <CheckBox
                  style={{flex: 1, justifyContent: 'center'}}
                  onClick={()=>this.setState({checkbox1: !checkbox1})}
                  isChecked={checkbox1}
                  checkBoxColor='#BF4D73'
                />
              </View>
              <View style={{flex: 0.9}}>
                <Text style={{color: '#4A4A4A', fontSize: 12, textAlign: textAlign, fontFamily: lang=='en'?'SFUIDisplay-Regular':'HelveticaNeueLTArabic-Light'}}>{strings('shoutout.CheckBox1')}</Text>
              </View>
            </View>
            {talentVip?<View style={{flex: 0.35, flexDirection: flexDirection}}>
              <View style={{flex: 0.1}}>
                <CheckBox
                  style={{flex: 1}}
                  onClick={()=>this.setState({checkbox2: !checkbox2})}
                  isChecked={checkbox2}
                  checkBoxColor='#BF4D73'
                />
              </View>
              <View style={{flex: 0.9}}>
                <Text style={{color: '#4A4A4A', fontSize: 12, textAlign: textAlign, fontFamily: lang=='en'?'SFUIDisplay-Regular':'HelveticaNeueLTArabic-Light'}}>{strings('shoutout.CheckBox2')}</Text>
                <Text style={{color: '#4A4A4A', fontSize: 12, textAlign: textAlign, fontFamily: lang=='en'?'SFUIDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('shoutout.CheckBox2Bold')}</Text>
              </View>
            </View>:null}
            <View style={{flex: 0.1}}></View>
            <View style={{flex: 0.3, flexDirection: flexDirection}}>
              <View style={{flex: 0.1}}></View>
              <View style={{flex: 0.9}}>
                <Text style={{color: '#9C9C9C', fontSize: 12, textAlign: textAlign, fontFamily: lang=='en'?'SFUIDisplay-Light':'HelveticaNeueLTArabic-Light'}}>{checkbox2?strings('shoutout.deliveryText1'):strings('shoutout.deliveryText')}</Text>
              </View>
            </View>
          </View>
          <View style={{flex: 0.02, minHeight: 20}}></View>
          <View style={{flex: 0.08}}>
            <TouchableOpacity style = {{flex:1, justifyContent:'center'}} disabled={isDisabled1} onPress = {() => this.sendRequest()}>
              <LinearGradient colors={['#8D3F7D', '#D8546E']} style = {{flex:1}} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <View style = {{backgroundColor: 'transparent',flex:0.8,justifyContent:'center', alignItems:'center', flexDirection: flexDirection}}>
                  <Text style = {{textAlign: 'center',color : 'white', fontSize: 16, fontFamily: lang=='en'?'SFUIText-Medium':'HelveticaNeueLTArabic-Roman'}}>{strings('shoutout.PayBTN')} </Text>
                  <View style={{justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', flexDirection: 'row'}}>
                    <Text style = {{textAlign: 'center',color : 'white', fontSize: 16, fontFamily: lang=='en'?'SFUIText-Medium':'HelveticaNeueLTArabic-Roman'}}>{strings('globalValues.Currency')} </Text>
                    <Text style={{textAlign: 'center',color : 'white', fontSize: 16, fontFamily: lang=='en'?'SFUIText-Medium':'HelveticaNeueLTArabic-Roman'}}>{this.promoVip()} </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAwareScrollView>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(userActions, dispatch)
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(shoutout);
