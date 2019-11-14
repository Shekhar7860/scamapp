import React, { Component } from 'react';
import { Platform, Text, View, ImageBackground, Dimensions, TouchableOpacity, Alert, ScrollView, Image, PermissionsAndroid, SafeAreaView, NetInfo } from 'react-native';
;
import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import RNFetchBlob from 'react-native-fetch-blob';
import FastImage from 'react-native-fast-image';

import { strings } from '../locales/i18n';
import Appurl from './../config';

import * as userActions from '../src/actions/userActions';
import Spinner from 'react-native-loading-spinner-overlay';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setTimeout } from 'core-js';

class talentInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: '',
      visible: false,
      image: '',
      name: '',
      bio: '',
      profession: '',
      profession1: '',
      rTalent: [],
      newrTalent: [],
      rVideos: []
    }
  }
  static navigatorStyle = {
    navBarHidden: true,
    tabBarHidden: true
  }

  componentDidMount() {
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      if (connectionInfo.type == 'none' || connectionInfo.type == 'unknown') {
        this.props.actions.checkInternet(false);
      }
      else {
        this.props.actions.checkInternet(true);
      }
    });
    NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);

    setTimeout(() => {
      if (!this.props.user.netStatus) {
        return Alert.alert(
          '',
          strings('globalValues.NetAlert'),
          [
            {
              text: strings('globalValues.AlertOKBtn'),
              onPress: () => {
                this.setState({ isDisabled: false, visible: false });
              }
            }
          ],
          { cancelable: false }
        );
      }
      else {
        this.setState({ visible: true })
        this.getTalentInfo();
      }
    }, 200);

  }
  componentWillUnmount() {
    let { actions } = this.props;
    actions.toggleButton(false);
    actions.toggleButton3(false);
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  getTalentInfo = () => {
    let talentInfo1 = { 'userId': this.props.user.loginFieldId.id, 'talentId': this.props.user.talentId, 'related1': this.props.user.related1, 'related2': this.props.user.related2 }
    console.log(talentInfo1);
    return axios.post(`${Appurl.apiUrl}fetchTalentInform`, talentInfo1)
      .then((response) => {
        console.log(response.data);
        return this.displayInfo(response);
      }).catch((error) => {
        console.log(error)
        if (error.response.msg) {
          Alert.alert(
            '',
            error.response.msg,
            [
              {
                text: strings('globalValues.AlertOKBtn'),
                onPress: () => {
                  this.setState({ isDisabled: false, visible: false });
                  this.props.actions.forceRefreshHome(true)
                  this.props.navigator.pop()
                }
              }
            ],
            { cancelable: false }
          )
        }
        else {
          Alert.alert(
            '',
            strings('globalValues.wrongMessage'),
            [
              {
                text: strings('globalValues.AlertOKBtn'),
                onPress: () => {
                  this.setState({ isDisabled: false, visible: false });
                  this.props.navigator.pop()
                }
              }
            ],
            { cancelable: false }
          )
        }
      })
  }
  displayInfo = (response) => {
    let { actions } = this.props;
    let { rTalent, name, rVideos } = this.state;
    this.setState({ image: response.data.data.talentData.profilePicUrl, name: response.data.data.talentData.name, bio: response.data.data.talentData.Bio });
    actions.setTalentOrderDetails(response.data.data.talentData.name, response.data.data.talentData.profilePicUrl)
    this.setState({ profession: this.props.user.lang == 'en' ? response.data.data.talentData.professions[0].professionCatagory.en : response.data.data.talentData.professions[0].professionCatagory.ar });
    this.setState({ profession1: response.data.data.talentData.professions[1] ? (this.props.user.lang == 'en' ? response.data.data.talentData.professions[1].professionCatagory.en : response.data.data.talentData.professions[1].professionCatagory.ar) : '' });
    actions.setImageTalent(response.data.data.talentData.profilePicUrl);
    actions.getPrice(response.data.data.talentData.price[0], response.data.data.VipPrice[0].amount);
    actions.setVip(response.data.data.talentData.vipAccepted)
    response.data.data.talentVedios.forEach((item, index) => {
      rVideos.push({ 'id': item._id, 'video': item.vedioUrl, 'duration': item.duration, 'for': item.forWhome, 'image': item.thumbnailUrl, 'videoName': item.videoName });
    });
    this.setState({ rVideos });
    response.data.data.relatedTalent.forEach((item, index) => {
      rTalent.push({ 'id': item._id, 'profession': this.props.user.lang == 'en' ? item.professions[0].professionCatagory.en : item.professions[0].professionCatagory.ar, 'profession1': item.professions[1] ? (this.props.user.lang == 'en' ? item.professions[1].professionCatagory.en : item.professions[1].professionCatagory.ar) : '', 'pic': item.profilePicUrl, 'name': item.name });
    });
    this.setState({ rTalent, visible: false });
  }
  newTalent = (id) => {
    if (!this.props.user.netStatus) {
      return Alert.alert(
        '',
        strings('globalValues.NetAlert'),
        [
          {
            text: strings('globalValues.AlertOKBtn'),
            onPress: () => {
              this.setState({ isDisabled: false, visible: false });
            }
          }
        ],
        { cancelable: false }
      );
    }
    else {
      let { actions } = this.props;
      this.setState({ isDisabled: true, visible: true });
      actions.getTalentId(id);
      this.setState({ rTalent: [], rVideos: [] });
      let talentInfo1 = { 'userId': this.props.user.loginFieldId.id, 'talentId': id, 'related1': this.props.user.related1, 'related2': this.props.user.related2 }
      console.log(talentInfo1);
      return axios.post(`${Appurl.apiUrl}fetchTalentInform`, talentInfo1)
        .then((response) => {
          console.log(response);
          this.setState({ isDisabled: false, visible: false })
          return this.displayInfo(response);
        }).catch((error) => {
          console.log(error.response);
          this.setState({ isDisabled: false, visible: false })
        })
    }
  }
  back = () => {
    this.props.navigator.pop();
  }
  requestPage = () => {
    let { actions } = this.props;
    actions.toggleButton(true);
    this.props.navigator.push({
      screen: 'shoutout'
    })
  }
  playVideo = async (filePath, fileName) => {
    if (Platform.OS == 'android' && Platform.Version > 22) {
      const granted = await PermissionsAndroid.requestMultiple(
        [
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        ]
      );
      if (granted['android.permission.WRITE_EXTERNAL_STORAGE'] != 'granted') {
        return Alert.alert(
          '',
          strings('globalValues.VideoSave'),
          [
            {
              text: strings('globalValues.AlertOKBtn'),
              onPress: () => {
                this.setState({ isDisabled: false, visible: false });
              }
            }
          ],
          { cancelable: false }
        );
      }
    }
    this.setState({ isDisabled: true, visible: true })
    this.props.actions.toggleButton2(true);
    let dirs;
    if (Platform.OS == 'ios') {
      dirs = RNFetchBlob.fs.dirs.DocumentDir;
    }
    else {
      dirs = RNFetchBlob.fs.dirs.MovieDir;
    }
    console.log(dirs)
    let famcamDir = dirs + '/FamCamUser';
    RNFetchBlob.fs.isDir(famcamDir)
      .then((isDir) => {
        console.log(isDir)
        if (!isDir) {
          console.log('not found')
          RNFetchBlob.fs.mkdir(famcamDir)
            .then(() => {
              RNFetchBlob
                .config({
                  // response data will be saved to this path if it has access right.
                  path: famcamDir + '/' + fileName
                })
                .fetch('GET', filePath, {
                  //some headers ..
                })
                .then((res) => {
                  console.log(res)
                  // the path should be dirs.DocumentDir + 'path-to-file.anything'
                  console.log('The file saved to ', res.path())
                  let playpath = res.path();
                  this.props.actions.setPlayVideo(playpath)
                  this.setState({ isDisabled: false, visible: false })
                  if (Platform.OS == 'ios') {
                    setTimeout(() => {
                      this.props.navigator.push({
                        screen: 'PlayVideo'
                      })
                    }, 1000)
                  }
                  else {
                    setTimeout(() => {
                      Navigation.showModal({
                        screen: 'PlayVideo'
                      })
                    }, 1000)
                  }
                })
            })
        }
        else {
          RNFetchBlob.fs.exists(famcamDir + '/' + fileName)
            .then((exist) => {
              console.log(exist)
              if (!exist) {
                RNFetchBlob
                  .config({
                    // response data will be saved to this path if it has access right.
                    path: famcamDir + '/' + fileName
                  })
                  .fetch('GET', filePath, {
                    //some headers ..
                  })
                  .then((res) => {
                    console.log(res)
                    // the path should be dirs.DocumentDir + 'path-to-file.anything'
                    console.log('The file saved to ', res.path())
                    let playpath = res.path();
                    this.props.actions.setPlayVideo(playpath)
                    this.setState({ isDisabled: false, visible: false })
                    if (Platform.OS == 'ios') {
                      setTimeout(() => {
                        this.props.navigator.push({
                          screen: 'PlayVideo'
                        })
                      }, 1000)
                    }
                    else {
                      setTimeout(() => {
                        Navigation.showModal({
                          screen: 'PlayVideo'
                        })
                      }, 1000)
                    }
                  })
              }
              else {
                let playpath = famcamDir + '/' + fileName;
                this.props.actions.setPlayVideo(playpath)
                this.setState({ isDisabled: false, visible: false })
                if (Platform.OS == 'ios') {
                  setTimeout(() => {
                    this.props.navigator.push({
                      screen: 'PlayVideo'
                    })
                  }, 1000)
                }
                else {
                  setTimeout(() => {
                    Navigation.showModal({
                      screen: 'PlayVideo'
                    })
                  }, 1000)
                }
              }
            })
            .catch((err) => {
              this.props.actions.toggleButton2(false);
              console.log(err)
            })
        }
      })
      .catch((err) => {
        this.props.actions.toggleButton2(false);
        console.log(err)
      })
  }
  render() {
    let { data, image, name, bio, profession, profession1, result, rTalent, newName, newImage, newProfession, videos, rVideos, visible } = this.state;
    let { flexDirection, textAlign, lang, price, isDisabled, isDisabled2 } = this.props.user;
    const Width = Dimensions.get('window').width;
    return (
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <Spinner visible={visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{ color: '#FFF' }} />
        <FastImage source={{ uri: `${Appurl.apiUrl}resizeimage?imageUrl=` + image + '&width=' + (Width * 2) + '&height=400' }} style={{ width: Width, height: 200 }}>
          <SafeAreaView style={{ flex: 1 }}>
            <TouchableOpacity hitSlop={{ top: 7, left: 7, bottom: 7, right: 7 }} style={{ height: 20, width: 24, justifyContent: 'center', margin: 20 }} onPress={() => { this.back() }}>
              <Image source={require('./../Images/ic_back_white.png')} style={{ height: 14, width: 18 }} />
            </TouchableOpacity>
          </SafeAreaView>
        </FastImage>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ height: 120, marginHorizontal: 24, borderRadius: 5 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', marginTop: 20, color: '#1F1D1D', textAlign: textAlign }}>{name}</Text>
            <Text style={{ marginTop: 5, color: '#4A4A4A', fontSize: 14, textAlign: textAlign }}>{profession} {profession1 ? '/' : null} {profession1}</Text>
            <Text numberOfLines={1} style={{ marginTop: 5, color: '#4A4A4A', fontSize: 14, textAlign: textAlign, fontFamily: lang == 'en' ? 'SFProDisplay-Regular' : 'HelveticaNeueLTArabic-Light' }}>{bio}</Text>
          </View>
          <View style={{ height: 10 }}></View>
          <ScrollView
            style={{ height: Dimensions.get('window').height - 340 }}
            showsVerticalScrollIndicator={false}
          >
            {rVideos.length ? <View style={{ flex: 0.2 }}>
              <Text style={{ fontSize: 16, color: '#1F1D1D', margin: 20, textAlign: textAlign, fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{strings('talentInfo.latest')}</Text>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                {rVideos.length ? rVideos.map((value, index) => {
                  return <View key={index} style={{ flex: 1, marginHorizontal: 20 }}>
                    <View style={{ width: 144, height: 232 }}>
                      <TouchableOpacity disabled={isDisabled2} activeOpacity={0.8} onPress={() => { this.playVideo(value.video, value.videoName) }}>
                        <LinearGradient colors={['black', 'black']} style={{ width: 144, height: 192, borderRadius: 4 }}>
                          <FastImage source={{ uri: `${Appurl.apiUrl}resizeimage?imageUrl=` + value.image + '&width=288&height=384' }} style={{ width: 144, height: 192, borderRadius: 4 }} />
                        </LinearGradient>
                        <Image source={require('./../Images/GroupCopy3x.png')} style={{ width: 24, height: 24, position: 'absolute', top: 160, left: 5 }} />
                        <Text style={{ backgroundColor: 'transparent', fontSize: 12, color: 'white', position: 'absolute', top: 10, left: 100, fontFamily: 'SFUIDisplay-Bold' }}>{value.duration}</Text>
                      </TouchableOpacity>
                      <View style={{ flex: 0.3 }}></View>
                      <View style={{ flexDirection: flexDirection }}>
                        <Text style={{ fontSize: 12, color: '#343434', textAlign: textAlign, fontFamily: lang == 'en' ? 'SFUIText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{strings('talentInfo.ForLabel')}  </Text>
                        <Text style={{ fontSize: 12, color: '#343434', textAlign: textAlign, fontWeight: 'bold' }}>{value.for}</Text>
                      </View>
                    </View>
                  </View>
                }) : null
                }
              </ScrollView>
            </View> : null}
            {rTalent.length ? <View style={{ flex: 0.3 }}>
              <Text style={{ fontSize: 16, margin: 20, color: '#1F1D1D', textAlign: textAlign, fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{strings('talentInfo.RelatedText')}</Text>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ flex: 1, marginRight: 10 }}>
                {rTalent.length ? rTalent.map((value, index) => {
                  return <View style={{ flex: 1, flexDirection: 'row' }} key={index}>
                    <View style={{ flex: 0.7, marginLeft: 20 }}>
                      <TouchableOpacity style={{ alignItems: lang == 'en' ? 'flex-start' : 'flex-end' }} activeOpacity={0.7} onPress={() => { this.newTalent(value.id) }}>
                        <FastImage source={{ uri: `${Appurl.apiUrl}resizeimage?imageUrl=` + value.pic + '&width=200&height=200' }} style={{ width: 100, height: 100, borderRadius: 10 }} />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 12, textAlign: textAlign, fontWeight: 'bold' }}>{value.name}</Text>
                      <Text style={{ textAlign: textAlign, fontSize: 12 }}>{value.profession} {value.profession1 ? '/' : null} {value.profession1}</Text>
                    </View>
                  </View>
                }) : null
                }
              </ScrollView>
            </View> : null}
          </ScrollView>
          <View style={{ height: 60, flexDirection: 'row', marginTop: 5 }}>
            <View style={{ flex: 0.7, justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}>
              <Text style={{ justifyContent: 'center', color: '#BF4D73', fontSize: 16, fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{strings('globalValues.Currency')} </Text>
              <Text style={{ color: '#BF4D73', fontSize: 16, fontFamily: 'SFUIDisplay-Bold' }}> {price}</Text>
            </View>
            <View style={{ flex: 0.3 }}>
              <TouchableOpacity disabled={isDisabled} style={{ flex: 1 }} onPress={() => { this.requestPage() }}>
                <LinearGradient colors={['#8D3F7D', '#D8546E']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={{ backgroundColor: 'transparent', color: 'white', fontSize: 14, textAlign: 'center', fontFamily: lang == 'en' ? 'Colfax-Medium' : 'HelveticaNeueLTArabic-Roman' }}>{strings('talentInfo.BookNowLabel')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(talentInfo);
