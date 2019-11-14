import React, { Component } from 'react';
import { SafeAreaView, TextInput, Alert, Text, View, Dimensions, Image, TouchableOpacity, ScrollView, NetInfo } from 'react-native';

import { Navigation } from 'react-native-navigation';
import { MKTextField } from 'react-native-material-kit';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';

import { strings } from '../locales/i18n';
import Appurl from './../config';
import Validation from './../src/utils/Validation.js';
import ValidationAr from './../src/utils/ValidationAr.js';

import * as userActions from '../src/actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class ChangePassword extends Component {
  static navigatorStyle = {
    navBarHidden: true,
    tabBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      isDisabled: false,
      visible: false,
      password: '',
      confirmPassword: '',
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
  back = () => {
    this.props.navigator.pop();
  }
  validationRules= () => {
    return [
      {
        field: this.state.password,
        name: 'Password',
        rules: 'required|no_space|min:6'
      },
      {
        field: this.state.confirmPassword,
        name: 'Confirm Password',
        rules: 'required|no_space|min:6'
      },
    ]
  }
  validationArRules= () => {
    return [
      {
        field: this.state.password,
        name: 'كلمة السر',
        rules: 'required|no_space|min:6'
      },
      {
        field: this.state.confirmPassword,
        name: 'تأكيد كلمة المرور',
        rules: 'required|no_space|min:6'
      },
    ]
  }
  done = ()=> {
    let {password, confirmPassword, visible, isDisabled} = this.state;
    let validation= this.props.user.lang=='en'?Validation.validate(this.validationRules()):ValidationAr.validate(this.validationArRules())
    if(validation.length!=0) {
      return Alert.alert(
        '',
        validation[0],
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
    else if(password!=confirmPassword) {
      return Alert.alert(
        '',
        strings('ChangePassword.noMatch'),
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
      this.setState({visible: true, isDisabled: true})
      let values = {'userId' : this.props.user.loginFieldId.id, 'password' : password}
      return axios.post(`${Appurl.apiUrl}changePasswordOfUser`, values)
      .then((response) => {
        console.log(response)
        Alert.alert(
          '',
          strings('ChangePassword.SuccessAlert'),
          [
            {
              text: strings('globalValues.AlertOKBtn'),
              onPress: () => {
                this.setState({isDisabled: false,visible: false});
                this.props.navigator.pop();
              }
            }
          ],
          { cancelable: false }
        );
      })
      .catch((error) => {
        if(error.response.data.success == 0) {
          Alert.alert(
            '',
            error.response.data.msg,
            [
              {
                text: 'Okay',
                onPress: () => {
                  this.setState({isDisabled: false, visible: false});
                }
              }
            ],
            { cancelable: false }
          );
        }
      })
    }
  }
  render() {
    let { password, visible, isDisabled } = this.state;
    let { textAlign, lang } = this.props.user;
    const windowHeight = Dimensions.get('window').height;
    const windowWidth = Dimensions.get('window').width;
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        <ScrollView style={{height: windowHeight, backgroundColor: '#ffffff'}} showsVerticalScrollIndicator={false}>
          <View style={{height: windowHeight, marginHorizontal: 24}}>
            <Spinner visible={visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
            <View style={{flex: 0.1, justifyContent: 'center'}}>
              <TouchableOpacity hitSlop={{top:7, bottom:7, left:7, right:7}} disabled={isDisabled} style={{height: 20, width:24, justifyContent: 'center'}} onPress={this.back}>
                <Image source={require('./../Images/icBack.png')} style={{tintColor: '#000000', height: 14, width:18}}/>
              </TouchableOpacity>
            </View>
            <View style={{flex:0.08, justifyContent: 'flex-start'}}>
              <Text style = {{color: '#000000', fontSize: 24, fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold', textAlign: textAlign}}>{strings('ChangePassword.passwordText')}</Text>
            </View>
            <View style={{flex:0.09}}>
              <Text style = {{textAlign: textAlign, fontSize: 14, color: '#474D57', fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light'}}>{strings('ChangePassword.mainText')}</Text>
            </View>
            <View style = {{flex:0.15}}>
              <MKTextField
                placeholder = {strings('ChangePassword.passwordLabel')}
                ref="password"
                placeholderTextColor='#AAAFB9'
                floatingLabelEnabled
                password={true}
                keyboardType = "default"
                returnKeyType = "next"
                textInputStyle = {{fontSize: 16, lineHeight: 24, color: '#474D57', textAlign: textAlign}}
                style = {{marginTop:10}}
                underlineSize={1}
                highlightColor='#474D57'
                tintColor='#C2567A'
                autoCorrect={false}
                autoCapitalize= 'none'
                onChangeText = {(text) => this.setState({password: text.trim()})}
                onSubmitEditing = {(event) => {this.refs.confirmPass.focus()}}
              />
            </View>
            <View style = {{flex:0.15}}>
              <MKTextField
                placeholder = {strings('ChangePassword.confirmPasswordLabel')}
                ref="confirmPass"
                placeholderTextColor='#AAAFB9'
                floatingLabelEnabled
                keyboardType = "default"
                password={true}
                returnKeyType = "done"
                returnKeyLabel = "done"
                textInputStyle = {{fontSize: 16, lineHeight: 24, color: '#474D57', textAlign: textAlign}}
                style = {{marginTop:10}}
                underlineSize={1}
                highlightColor='#474D57'
                tintColor='#C2567A'
                autoCorrect={false}
                autoCapitalize= 'none'
                onChangeText = {(text) => this.setState({confirmPassword: text.trim()})}
              />
            </View>
            <View style={{flex: 0.12, justifyContent: 'center'}}>
              <TouchableOpacity style={{flex: 0.75, justifyContent: 'center', borderRadius: 2}} onPress={this.done}>
                <LinearGradient colors={['#8D3F7D', '#D8546E']} style={{flex:1, borderRadius: 2}} start={{x:0, y:0}} end={{x:1, y:0}}>
                  <View style={{flex:1, justifyContent: 'center', backgroundColor: 'transparent'}}>
                    <Text style={{color: '#FFFFFF', textAlign: 'center', fontSize: 14, fontFamily: lang=='en'?'SFUIText-Medium':'HelveticaNeueLTArabic-Roman'}}>{strings('ContactUs.SendBTN')}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);
