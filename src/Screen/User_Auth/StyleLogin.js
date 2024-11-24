import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { color } from '../../assets/color/color';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.backgroudcolor,
  },
  header: {
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: '10%',
    height: '25%',
  },
  font: {
    fontSize: 40,
    fontWeight: '900',
  },
  body: {
    flex: 0.6,
  },
  bodycon: {
    marginHorizontal: '5%',
    marginVertical: '20%',
  },
  IuserName: {
    width: '100%',
    height: '20%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 40,
    borderWidth: 1,
    marginVertical: '2%',
    borderColor: color.gray,
  },

  textinput: {
    marginLeft: '1%',
    fontSize: 15,
    width: '80%',
    fontWeight: 'bold',
    color: color.black,
  },
  eye: {
    marginLeft: 50,
  },
  button: {
    marginTop: '4%',

    width: '100%',
    height: '18%',
  },
  linagradine: {
    flex: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTxt: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  ViewIcon: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10%',
  },
  icon: {
    width: 54,
    height: 54,
    borderRadius: 40,
    backgroundColor: color.backgroudcolor,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  labelwith: {
    fontSize: 15,
  },
  flooter: {
    flex: 0.2,
  },
});
export default styles;
