import React, { Component } from 'react';
import { Platform, SafeAreaView, View, Image, TouchableOpacity } from 'react-native';

import { Navigation } from 'react-native-navigation';
import Video from 'react-native-video';

import * as userActions from '../src/actions/userActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class PlayVideo extends Component {
  static navigatorStyle = {
    navBarHidden: true,
    tabBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      isDisabled: false,
      visible: false
    }
  }
  componentWillUnmount() {
    this.props.actions.toggleButton3(false);
    this.props.actions.toggleButton2(false);
  }
  back = ()=> {
    if(Platform.OS=='ios') {
      this.props.navigator.pop()
    }
    else {
      Navigation.dismissModal()
    }
  }
  loadStart = (res)=> {
    console.log("loadStart------>", res)
  }
  setDuration = (res)=> {
    console.log("setDuration------>", res)
  }
  setTime = (res)=> {
    console.log("setTime------>", res)
  }
  onEnd = (res)=> {
    console.log("onEnd------>", res)
  }
  videoError = (res)=> {
    console.log("videoError------>", res)
  }
  render() {
    let { isDisabled, visible } = this.state;
    let { playpath } = this.props.user;
    return (
      <View style={{flex: 1}}>
        <Video source={{uri: playpath}}
          rate={1.0}                   // 0 is paused, 1 is normal.
          volume={1.0}
          muted={false}
          paused={false}               // Pauses playback entirely.
          resizeMode="cover"           // Fill the whole screen at aspect ratio.
          repeat={true}                // Repeat forever.
          onLoadStart={(e)=>this.loadStart(e)} // Callback when video starts to load
          onLoad={(e)=>this.setDuration(e)}    // Callback when video loads
          onProgress={(e)=>this.setTime(e)}    // Callback every ~250ms with currentTime
          onEnd={(e)=>this.onEnd(e)}           // Callback when playback finishes
          onError={(e)=>this.videoError(e)}    // Callback when video cannot be loaded
          style={{flex: 1}}
         />
         <SafeAreaView style={{marginHorizontal: 24, position: 'absolute', right:0, left:0, top:30}}>
           <TouchableOpacity hitSlop={{top:7, bottom:7, left:7, right:7}} disabled={isDisabled} style={{height: 20, width:24, justifyContent: 'center'}} onPress={this.back}>
             <Image source={require('./../Images/icBack.png')} style={{tintColor: '#ffffff', height: 14, width:18}}/>
           </TouchableOpacity>
         </SafeAreaView>
       </View>
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

 export default connect(mapStateToProps, mapDispatchToProps)(PlayVideo);
