import React, { Component } from 'react';
import { Platform, SafeAreaView, Text, View, Image, TouchableOpacity, Alert, WebView } from 'react-native';

import { Navigation } from 'react-native-navigation';
import KeepAwake from 'react-native-keep-awake';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import LinearGradient from 'react-native-linear-gradient';

import { strings } from '../locales/i18n';
import Appurl from './../config';

import * as userActions from '../src/actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class paymentWeb extends Component {
  static navigatorStyle = {
    navBarHidden : true,
    tabBarHidden : true
  }
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
    if(Platform.OS=='ios') {
      this.setState({visible: true})
    }
  }
  onWebViewLoad(){
    console.log('loaded')
  }
  onNavigationStateChange = async (event)=> {
    console.log(event)
    await this.setState({visible: event.loading})
  }
  onWebViewMessage = (event)=> {
    console.log(event.nativeEvent)
    console.log(event.nativeEvent.data)
    if(event.nativeEvent.data.includes('success')) {
      this.setState({visible: false})
      console.log('success', event.nativeEvent.data.slice(9,event.nativeEvent.data.length))
      this.props.actions.setTalentPaymentDetails(this.props.user.payName, this.props.user.payInstructions, this.props.user.payAmount, event.nativeEvent.data.slice(7,event.nativeEvent.data.length), this.props.user.payVip)
      KeepAwake.deactivate();
      this.props.actions.toggleButton1(false);
      this.props.actions.toggleButton2(false);
      setTimeout(()=> {
        Alert.alert(
          '',
          strings('shoutout.SuccessfullAlert'),
          [
            {
              text: strings('globalValues.AlertOKBtn'),
              onPress: () => {
                this.props.navigator.push({
                  screen: 'AfterPayment'
                })
              }
            }
          ],
          { cancelable: false }
        );
      }, 600)
    }
    else if(event.nativeEvent.data=='failed') {
      this.setState({visible: false})
      Alert.alert(
        '',
        strings('shoutout.UnsuccessfullAlert'),
        [
          {
            text: strings('globalValues.AlertOKBtn'),
            onPress: () => {
              this.setState({visible: false});
              this.props.actions.toggleButton1(false);
              this.props.actions.toggleButton2(false);
              KeepAwake.deactivate();
              this.props.navigator.pop()
            }
          }
        ],
        { cancelable: false }
      );
    }
  }
  loadRequest(event){
    console.log(event)
    return true
  }
  close = ()=> {
    this.props.actions.toggleButton1(false)
    this.props.navigator.pop()
  }
  render() {
    let { visible } = this.state;
    let { lang } = this.props.user;
    return (
      <View style={{flex: 1}}>
        <Spinner visible={visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
        <View style={{height: 80}}>
          <LinearGradient colors={['#8D3F7D', '#D8546E']} style = {{flex: 1, justifyContent: 'center'}} start={{ x: 0, y: 1 }} end={{ x: 1, y: 1 }}>
            <SafeAreaView style={{alignItems: 'center', marginHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity hitSlop = {{top:7, left:7, bottom:7, right:7}} style={{height: 20, width:24, justifyContent: 'center'}} onPress={this.close}>
                <Image source={require('./../Images/icBack.png')} style={{tintColor: '#FFFFFF',height: 20, width:24}}/>
              </TouchableOpacity>
              <View style={{backgroundColor: 'transparent'}}>
                <Text style = {{color: '#FFFFFF', fontSize: 20, fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('payment.PaymentText')}</Text>
              </View>
              <View style={{width: 24}}></View>
            </SafeAreaView>
          </LinearGradient>
        </View>
        <WebView
          // "https://api.famcam.co/paymentPage"+this.props.paymentData
          onLoad={this.onWebViewLoad}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          ref={webview => {this.webViewRef = webview;}}
          source={{uri: "https://api.famcam.co/paymentPage"+this.props.paymentData}}
          onMessage={this.onWebViewMessage}
          onNavigationStateChange={this.onNavigationStateChange}
          onShouldStartLoadWithRequest={this.loadRequest}
          // startInLoadingState={true}
        />
      </View>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(paymentWeb);
