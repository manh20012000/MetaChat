import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import useSetting from '../Component/useSetting';
const SettingComponent: React.FC = () => {
  const { settings, toggleSetting } = useSetting();

  return (
    <View style={styles.container}>
      {settings.map((category, categoryIndex) => (
        <View key={category.title} style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          
          {category.items.map((item) => (
            <View key={item.id} style={styles.settingItem}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>{item.label}</Text>
                {item.extraInfo && <Text style={styles.extraInfo}>{item.extraInfo}</Text>}
              </View>
              
              <Switch
                value={item.value}
                onValueChange={() => toggleSetting(categoryIndex, item.id)}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  extraInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default SettingComponent;