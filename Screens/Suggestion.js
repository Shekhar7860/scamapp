import React, { Component } from 'react';
import { Text, View, Image, TouchableOpacity, Alert, TextInput, SafeAreaView, NetInfo } from 'react-native';

import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import { MKTextField } from 'react-native-material-kit';
import LinearGradient from 'react-native-linear-gradient';

import { strings } from '../locales/i18n';
import Appurl from './../config';

import * as userActions from '../src/actions/userActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class Suggestion extends Component {
  static navigatorStyle = {
    navBarHidden: true,
    tabBarHidden: true
  }
  constructor(props) {
    super(props);
    this.state = {
      isDisabled: false,
      visible: false,
      name: '',
      url: ''
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
        field: this.state.name,
        name: 'Name',
        rules: 'required|min:2|max:50'
      },
      {
        field: this.state.url,
        name: 'URL',
        rules: 'required'
      },
    ]
  }
  send = () => {
    let {contactText, visible, isDisabled, name, url} = this.state;
    let validation= Validation.validate(this.validationRules());
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
      let values = {'userId': this.props.user.loginFieldId.id, 'name' : name, 'url' : url}
      return axios.post(`${Appurl.apiUrl}userSuggestionsToAdmin`, values)
      .then((response) => {
        console.log(response)
        Alert.alert(
          '',
          strings('Suggestion.SuccessAlertText'),
          [
            {
              text: strings('globalValues.AlertOKBtn'),
              onPress: () => {
                this.setState({isDisabled: false, visible: false});
                this.props.navigator.pop();
              }
            }
          ]
        )
      }).catch((error) => {
        if(error.response.data.success == 0) {
          Alert.alert(
            '',
            error.response.data.msg,
            [
              {
                text: strings('globalValues.AlertOKBtn'),
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
    let { isDisabled, visible } = this.state;
    let { textAlign, lang } = this.props.user;
    return (
      <SafeAreaView style={{flex:1, backgroundColor: 'white'}}>
        <View style={{flex:1, marginHorizontal: 24}}>
          <Spinner visible={visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
          <View style={{flex: 0.1, justifyContent: 'center'}}>
            <TouchableOpacity hitSlop={{top:7, bottom:7, left:7, right:7}} disabled={isDisabled} style={{height: 20, width:24, justifyContent: 'center'}} onPress={this.back}>
              <Image source={require('./../Images/icBack.png')} style={{tintColor: '#000000', height: 14, width:18}}/>
            </TouchableOpacity>
          </View>
          <View style={{flex:0.08, justifyContent: 'flex-start'}}>
            <Text style = {{textAlign: textAlign, color: '#000000', fontSize: 24, fontFamily: lang=='en'?'SFUIDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('Suggestion.SuggestionText')}</Text>
          </View>
          <View style={{flex:0.09}}>
            <Text style = {{textAlign: textAlign, fontSize: 14, color: '#474D57', fontFamily: lang=='en'?'SFUIDisplay-Regular':'HelveticaNeueLTArabic-Light'}}>{strings('Suggestion.MainText')}</Text>
          </View>
          <View style={{flex: 0.08}}></View>
          <View style={{flex:0.1}}>
            <MKTextField
              placeholder = {strings('Suggestion.NameLabel')}
              ref="name"
              placeholderTextColor='#AAAFB9'
              floatingLabelEnabled
              keyboardType = "default"
              returnKeyType = "next"
              textInputStyle = {{textAlign: textAlign, fontSize: 16, color: '#474D57'}}
              style = {{marginTop:10}}
              underlineSize={1}
              highlightColor='#474D57'
              tintColor='#C2567A'
              autoCorrect={false}
              autoCapitalize= 'none'
              onChangeText = {(text) => this.setState({name: text.trim()})}
              onSubmitEditing = {(event) => {this.refs.url.focus();}}
            />
          </View>
          <View style={{flex: 0.03}}></View>
          <View style={{flex:0.1}}>
            <MKTextField
              placeholder = {strings('Suggestion.UrlLabel')}
              ref="url"
              placeholderTextColor='#AAAFB9'
              floatingLabelEnabled
              keyboardType = "default"
              returnKeyType = "done"
              returnKeyLabel = "done"
              textInputStyle = {{textAlign: textAlign, fontSize: 16, color: '#474D57'}}
              style = {{marginTop:10}}
              underlineSize={1}
              highlightColor='#474D57'
              tintColor='#C2567A'
              autoCorrect={false}
              autoCapitalize= 'none'
              onChangeText = {(text) => this.setState({url: text.trim()})}
            />
          </View>
          <View style={{flex:0.35}}></View>
          <View style={{flex: 0.12, justifyContent: 'center'}}>
            <TouchableOpacity style={{flex: 0.75, justifyContent: 'center', borderRadius: 2}} onPress={this.send}>
              <LinearGradient colors={['#8D3F7D', '#D8546E']} style={{flex:1, borderRadius: 2}} start={{x:0, y:0}} end={{x:1, y:0}}>
                <View style={{flex:1, justifyContent: 'center', backgroundColor: 'transparent'}}>
                  <Text style={{color: '#FFFFFF', textAlign: 'center', fontSize: 14, fontFamily: lang=='en'?'SFUIText-Medium':'HelveticaNeueLTArabic-Roman'}}>{strings('ContactUs.SendBTN')}</Text>
                </View>
              </LinearGradient>
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

export default connect(mapStateToProps, mapDispatchToProps)(Suggestion);
