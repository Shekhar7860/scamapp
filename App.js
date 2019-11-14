import { Navigation } from 'react-native-navigation';
import { registerScreens } from './screens';
import { AsyncStorage, View } from 'react-native';
import { Provider } from 'react-redux';
import configureStore from './src/configureStore';
import { strings } from './locales/i18n';
import I18n from 'react-native-i18n';

const store = configureStore();

registerScreens(store, Provider);

// Navigation.startSingleScreenApp({
//   screen: {
//     screen : 'payment'
//   },
// });
try {
  AsyncStorage.getItem('user')
  .then((response) => {
    if(response == null) {
      AsyncStorage.getItem('lang')
      .then((lang) => {
        if(lang!=null) {
          let getlang = JSON.parse(lang);
          if(getlang=='ar') {
            console.log('this')
            I18n.locale = 'ar';
            I18n.currentLocale();
            Navigation.startSingleScreenApp({
              screen: {
                screen : 'home'
              },
              appStyle: {
                orientation: 'portrait'
              }
            });
          }
          else {
            console.log('this')
            I18n.locale = 'en';
            I18n.currentLocale();
            Navigation.startSingleScreenApp({
              screen: {
                screen : 'home'
              },
              appStyle: {
                orientation: 'portrait'
              }
            });
          }
        }
        else {
          if(I18n.currentLocale()=='ar') {
            I18n.locale = 'ar';
            I18n.currentLocale();
            Navigation.startSingleScreenApp({
              screen: {
                screen : 'home'
              },
              appStyle: {
                orientation: 'portrait'
              }
            });
          }
          else {
            I18n.locale = 'en';
            I18n.currentLocale();
            Navigation.startSingleScreenApp({
              screen: {
                screen : 'home'
              },
              appStyle: {
                orientation: 'portrait'
              }
            });
          }
        }
      })
    }
    else {
      AsyncStorage.getItem('lang')
      .then((lang) => {
        if(lang!=null) {
          let getlang = JSON.parse(lang);
          if(getlang=='ar') {
            I18n.locale = 'ar';
            I18n.currentLocale();
            Navigation.startTabBasedApp({
              tabs: [
            {
              label: strings('globalValues.Tab1'),
              screen: 'famcamHome',
              icon: require('./Images/ic_home_outline.png'),
              selectedIcon: require('./Images/ic_home_filled.png'), // local image asset for the tab icon selected state (optional, iOS only. On Android, Use `tabBarSelectedButtonColor` instead)
              title: 'Home',
            },
            {
              label: strings('globalValues.Tab2'),
              screen: 'orders',
              icon: require('./Images/ic_clipboards_outline.png'),
              selectedIcon: require('./Images/ic_clipboards_filled.png'),
              title: 'Orders',
            },
            {
              label: strings('globalValues.Tab3'),
              screen: 'profile',
              icon: require('./Images/ic_profile_outline.png'),
              selectedIcon: require('./Images/ic_profile_filled.png'),
              title: 'Profile',
            },
          ],
          tabsStyle: {
            tabBarButtonColor: '#C54C72',
            tabBarLabelColor: '#C54C72',
            tabBarSelectedButtonColor: '#C54C72',
            tabBarBackgroundColor: 'white',
            initialTabIndex: 0,
            tabBarTextFontFamily: 'HelveticaNeueLTArabic-Roman'
          },
          appStyle: {
            orientation: 'portrait',
            tabBarSelectedButtonColor: '#C54C72',
            tabFontFamily: 'HelveticaNeueLTArabic-Roman'
          },
            })
          }
          else {
            I18n.locale = 'en';
            I18n.currentLocale();
            Navigation.startTabBasedApp({
              tabs: [
                {
                  label: strings('globalValues.Tab1'),
                  screen: 'famcamHome',
                  icon: require('./Images/ic_home_outline.png'),
                  selectedIcon: require('./Images/ic_home_filled.png'), // local image asset for the tab icon selected state (optional, iOS only. On Android, Use `tabBarSelectedButtonColor` instead)
                  title: 'Home',
                },
                {
                  label: strings('globalValues.Tab2'),
                  screen: 'orders',
                  icon: require('./Images/ic_clipboards_outline.png'),
                  selectedIcon: require('./Images/ic_clipboards_filled.png'),
                  title: 'Orders',
                },
                {
                  label: strings('globalValues.Tab3'),
                  screen: 'profile',
                  icon: require('./Images/ic_profile_outline.png'),
                  selectedIcon: require('./Images/ic_profile_filled.png'),
                  title: 'Profile',
                },
          ],
          tabsStyle: {
            tabBarButtonColor: '#C54C72',
            tabBarLabelColor: '#C54C72',
            tabBarSelectedButtonColor: '#C54C72',
            tabBarBackgroundColor: 'white',
            initialTabIndex: 0,
            tabBarTextFontFamily: 'SFUIDisplay-Medium'
          },
          appStyle: {
            orientation: 'portrait',
            tabBarSelectedButtonColor: '#C54C72',
            tabFontFamily: 'SFUIDisplay-Medium'
          },
            })
          }
        }
        else {
          if(I18n.currentLocale()=='ar') {
            I18n.locale = 'ar';
            I18n.currentLocale();
            Navigation.startTabBasedApp({
              tabs: [
                {
                  label: strings('globalValues.Tab1'),
                  screen: 'famcamHome',
                  icon: require('./Images/ic_home_outline.png'),
                  selectedIcon: require('./Images/ic_home_filled.png'), // local image asset for the tab icon selected state (optional, iOS only. On Android, Use `tabBarSelectedButtonColor` instead)
                  title: 'Home',
                },
                {
                  label: strings('globalValues.Tab2'),
                  screen: 'orders',
                  icon: require('./Images/ic_clipboards_outline.png'),
                  selectedIcon: require('./Images/ic_clipboards_filled.png'),
                  title: 'Orders',
                },
                {
                  label: strings('globalValues.Tab3'),
                  screen: 'profile',
                  icon: require('./Images/ic_profile_outline.png'),
                  selectedIcon: require('./Images/ic_profile_filled.png'),
                  title: 'Profile',
                },
          ],
          tabsStyle: {
            tabBarButtonColor: '#C54C72',
            tabBarLabelColor: '#C54C72',
            tabBarSelectedButtonColor: '#C54C72',
            tabBarBackgroundColor: 'white',
            initialTabIndex: 0,
            tabBarTextFontFamily: 'HelveticaNeueLTArabic-Roman'
          },
          appStyle: {
            orientation: 'portrait',
            tabBarSelectedButtonColor: '#C54C72',
            tabFontFamily: 'HelveticaNeueLTArabic-Roman'
          },
            })
          }
          else {
            I18n.locale = 'en';
            I18n.currentLocale();
            Navigation.startTabBasedApp({
              tabs: [
                {
                  label: strings('globalValues.Tab1'),
                  screen: 'famcamHome',
                  icon: require('./Images/ic_home_outline.png'),
                  selectedIcon: require('./Images/ic_home_filled.png'), // local image asset for the tab icon selected state (optional, iOS only. On Android, Use `tabBarSelectedButtonColor` instead)
                  title: 'Home',
                },
                {
                  label: strings('globalValues.Tab2'),
                  screen: 'orders',
                  icon: require('./Images/ic_clipboards_outline.png'),
                  selectedIcon: require('./Images/ic_clipboards_filled.png'),
                  title: 'Orders',
                },
                {
                  label: strings('globalValues.Tab3'),
                  screen: 'profile',
                  icon: require('./Images/ic_profile_outline.png'),
                  selectedIcon: require('./Images/ic_profile_filled.png'),
                  title: 'Profile',
                },
          ],
          tabsStyle: {
            tabBarButtonColor: '#C54C72',
            tabBarLabelColor: '#C54C72',
            tabBarSelectedButtonColor: '#C54C72',
            tabBarBackgroundColor: 'white',
            initialTabIndex: 0,
            tabBarTextFontFamily: 'SFUIDisplay-Medium'
          },
          appStyle: {
            orientation: 'portrait',
            tabBarSelectedButtonColor: '#C54C72',
            tabFontFamily: 'SFUIDisplay-Medium'
          },
            })
          }
        }
      })

    }
  })
}
catch(error) {}
