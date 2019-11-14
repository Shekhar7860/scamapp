import React, { Component } from 'react';
import { Text, View, Image, TouchableOpacity, Alert, ScrollView, SafeAreaView, NetInfo } from 'react-native';

import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';

import { strings } from '../locales/i18n';
import Appurl from './../config';

import * as userActions from '../src/actions/userActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class termsAndConditions extends Component {
  static navigatorStyle = {
    navBarHidden: true,
    tabBarHidden: true
  }
  constructor(props) {
    super(props);
    this.state = {
      textshow: '',
      visible: false
    }
  }
  showContent = ()=> {
    let { lang } = this.props.user;
    this.setState({visible: true})
    return axios.get(`${Appurl.apiUrl}termsAndConditionsofUser`)
    .then((response) => {
      this.setState({visible: false, textshow: lang=='en'?response.data.data[0].termsandconditions.en:response.data.data[0].termsandconditions.ar});
    }).catch((error) => {
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
      )
    })
  }
  back = () => {
    this.props.navigator.pop();
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

    setTimeout(() => {
      if(!this.props.user.netStatus) {
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
      else{
        this.showContent();
      }
    }, 200);
  }
  componentWillUnmount() {
    let {actions} = this.props;
    actions.toggleButton(false);
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }
  render() {
    let { visible, textshow } = this.state;
    let { textAlign, lang } = this.props.user;
    return (
      <SafeAreaView style={{flex:1, backgroundColor: 'white'}}>
        <View style={{flex:1, marginHorizontal: 24}}>
          <Spinner visible={visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
          <View style={{flex: 0.1, justifyContent: 'center'}}>
            <TouchableOpacity hitSlop = {{top:7, left:7, bottom:7, right:7}} style={{height: 20, width:24, justifyContent: 'center'}} onPress={() => {this.back()}}>
              <Image source={require('./../Images/icBack.png')} style={{height: 14, width:18}}/>
            </TouchableOpacity>
          </View>
          <View style = {{flex:0.08, justifyContent:'center'}}>
            <Text style = {{textAlign: textAlign, fontSize:24, color:'#4A4A4A', fontFamily: lang=='en'?'SFUIDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('settings.tc')}</Text>
          </View>
          <View style = {{flex:0.8}}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{flex:1}}
              >
              <Text style={{textAlign: textAlign, fontFamily: lang=='en'?'SFUIDisplay-Regular':'HelveticaNeueLTArabic-Light'}}>{textshow}</Text>
            </ScrollView>
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

export default connect(mapStateToProps, mapDispatchToProps)(termsAndConditions);
