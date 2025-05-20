import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ClienteScreen} from '../views/ClienteScreen';
import {ServicoScreen} from '../views/ServicoScreen';
import {BarbeiroScreen} from '../views/BarbeiroScreen';
import {ProdutoScreen} from '../views/ProdutoScreen';
import {AgendamentoScreen} from '../views/AgendamentoScreen';
import {DashboardScreen} from '../views/DashboardScreen';

export type RootStackParamList = {
  Clientes: undefined;
  Servicos: undefined;
  Barbeiros: undefined;
  Produtos: undefined;
  Agendamento: undefined;
  Dashboard: undefined;
  //  rotas
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{title: 'Dashboard'}}
        />
        <Stack.Screen
          name="Clientes"
          component={ClienteScreen}
          options={{title: 'Clientes'}}
        />
        <Stack.Screen
          name="Servicos"
          component={ServicoScreen}
          options={{title: 'Serviços'}}
        />
        <Stack.Screen
          name="Barbeiros"
          component={BarbeiroScreen}
          options={{title: 'Barbeiros'}}
        />
        <Stack.Screen
          name="Produtos"
          component={ProdutoScreen}
          options={{title: 'Produtos'}}
        />
        <Stack.Screen
          name="Agendamento"
          component={AgendamentoScreen}
          options={{title: 'Agendamentos'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
