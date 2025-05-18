import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

type MenuItem = {
  name: string;
  route: keyof RootStackParamList;
};

export const Menu: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const menuItems: MenuItem[] = [
    {name: 'Dashboard', route: 'Dashboard'},
    {name: 'Clientes', route: 'Clientes'},
    {name: 'Serviços', route: 'Servicos'},
    {name: 'Barbeiros', route: 'Barbeiros'},
    {name: 'Produtos', route: 'Produtos'},
    {name: 'Agendamentos', route: 'Agendamento'},
  ];

  return (
    <View style={styles.container}>
      {menuItems.map(item => (
        <TouchableOpacity
          key={item.route}
          style={styles.menuItem}
          onPress={() => navigation.navigate(item.route)}>
          <Text style={styles.menuText}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  menuItem: {
    padding: 12,
  },
  menuText: {
    color: '#2196F3',
    fontSize: 12,
    textAlign: 'center',
  },
});
