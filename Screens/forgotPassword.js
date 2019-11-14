import React, { Component } from 'react';
import { Platform, Text, View, Image, TouchableOpacity, Alert, SafeAreaView,NetInfo } from 'react-native';

import { Navigation } from 'react-native-navigation';
import { MKTextField } from 'react-native-material-kit';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import CountryPicker from 'react-native-country-picker-modal';

import { strings } from '../locales/i18n';
import Appurl from './../config';
import Validation from './../src/utils/Validation.js';
import ValidationAr from './../src/utils/ValidationAr.js';

import * as userActions from '../src/actions/userActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class forgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phone : '',
      countryCode : '+966',
      cca2: 'SA',
      visible : false
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
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }
  static navigatorStyle = {
    navBarHidden : true
  }
  validationRules= () => {
    return [
      {
        field: this.state.phone,
        name: 'Phone Number',
        rules: 'required|no_space'
      }
    ]
  }
  validationArRules= () => {
    return [
      {
        field: this.state.phone,
        name: 'رقم الجوال',
        rules: 'required|no_space'
      }
    ]
  }
  back = () => {
    this.props.navigator.pop();
  }
  passwordReset = () => {
    let {phone, countryCode} = this.state;
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
      this.setState({visible: true});
      let number = {'phoneNumber' : phone, 'callingCode' : countryCode, 'langaugeType': this.props.user.lang};
      return axios.post(`${Appurl.apiUrl}forgotUser`, number)
      .then((response) => {
        console.log(response)
        return this.passwordSet(response);
      }).catch((error) => {
        console.log(error)
        this.setState({visible: false});
        if(error.response.data.success == 0) {
          if(Platform.OS=='ios') {
            setTimeout(()=> {
              Alert.alert(
                '',
                error.response.data.msg,
                [
                  {
                    text: strings('globalValues.AlertOKBtn'),
                    onPress: () => {
                      this.setState({visible: false});
                    }
                  }
                ],
                { cancelable: false }
              );
            }, 600)
          }
          else {
            Alert.alert(
              '',
              error.response.data.msg,
              [
                {
                  text: strings('globalValues.AlertOKBtn'),
                  onPress: () => {
                    this.setState({visible: false});
                  }
                }
              ],
              { cancelable: false }
            );
          }
        }
      })
    }
  }
  passwordSet = (response) => {
    Alert.alert(
      '',
      strings('forgotPassword.SuccessAlertText'),
      [
        {
          text: strings('globalValues.AlertOKBtn'),
          onPress: () => {
            this.setState({visible: false});
            this.props.navigator.pop()
          }
        }
      ],
      { cancelable: false }
    );
  }
  countryPickerModal = ()=> {
    this.refs.CountryPicker.openModal();
  }
  render() {
    let { phone, countryCode, visible } = this.state;
    let { flexDirection, textAlign, lang } = this.props.user;
    return (
      <SafeAreaView style={{flex:1, backgroundColor: 'white'}}>
        <View style={{flex:1, marginHorizontal: 24}}>
          <Spinner visible={visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
          <View style={{flex: 0.1, justifyContent: 'center'}}>
            <TouchableOpacity hitSlop = {{top:7, left:7, bottom:7, right:7}} style={{height: 20, width:24, justifyContent: 'center'}} onPress={() => {this.back()}}>
              <Image source={require('./../Images/icBack.png')} style={{height: 14, width:18}}/>
            </TouchableOpacity>
          </View>
          <View style={{flex:0.08, justifyContent: 'flex-start'}}>
            <Text style = {{fontSize: 24, color: '#000000', fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold', textAlign: textAlign}}> {strings('forgotPassword.text')} </Text>
          </View>
          <View style={{flex:0.09}}>
            <Text style = {{fontSize: 14, color: '#474D57', fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light', textAlign: textAlign}}> {strings('forgotPassword.heading')} </Text>
          </View>
          <View style = {{flex: 0.15, flexDirection: flexDirection}}>
            <TouchableOpacity style={{flex: 0.3, alignItems: 'center', flexDirection: flexDirection}} onPress={this.countryPickerModal}>
              <CountryPicker
                ref="CountryPicker"
                onChange={value => {
                  this.setState({ cca2: value.cca2, countryCode: '+'+value.callingCode })
                }}
                cca2={this.state.cca2}
                filterable
              />
              <Text style={{textAlign: 'center', marginTop: 4, fontSize: 16, marginEnd: this.props.user.lang=='en'?null:5, marginStart: this.props.user.lang=='en'?5:null}}> {this.state.countryCode}</Text>
            </TouchableOpacity>
            <View style={{flex:0.7}}>
              <MKTextField
                placeholder = {strings('forgotPassword.placeholder')}
                ref="phoneNumber"
                placeholderTextColor='#AAAFB9'
                floatingLabelEnabled
                keyboardType = "phone-pad"
                returnKeyType = "done"
                returnKeyLabel="done"
                textInputStyle = {{fontSize: 16, color: '#474D57', textAlign: textAlign}}
                style = {{marginTop:10}}
                highlightColor = '#474D57'
                tintColor = '#C2567A'
                underlineSize={1}
                autoCorrect={false}
                autoCapitalize= 'none'
                onChangeText = {(phone) => {this.setState({phone})}}
              />
            </View>
          </View>
          <View style = {{flex:0.1,alignItems : 'flex-end'}}>
            <TouchableOpacity activeOpacity={0.5} onPress = {() => {this.passwordReset()}}>
              <Image source = {require('./../Images/fab.png')} style={{height: 56, width: 56}} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(userActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(forgotPassword);
