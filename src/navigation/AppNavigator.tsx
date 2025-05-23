import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ClienteScreen} from '../views/ClienteScreen';
import {ServicoScreen} from '../views/ServicoScreen';
import {BarbeiroScreen} from '../components/LoginBarbeiro';
import {ProdutoScreen} from '../views/ProdutoScreen';
import {AgendamentoScreen} from '../views/AgendamentoScreen';
import {DashboardScreen} from '../views/DashboardScreen';
import {LoginScreen} from '../screens/LoginScreen';
import {CadastroScreen} from '../screens/CadastroScreen';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Clientes: undefined;
  Servicos: undefined;
  Barbeiros: undefined;
  Produtos: undefined;
  Agendamento: undefined;
  Dashboard: undefined;
  Cadastro: undefined;
  Login: undefined;
  Cliente: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type ClientesWrapperProps = NativeStackScreenProps<
  RootStackParamList,
  'Clientes'
>;

const ClientesWrapper: React.FC<ClientesWrapperProps> = props => (
  <ClienteScreen
    {...props}
    onLogout={async (): Promise<void> => {
      props.navigation.navigate('Login');
    }}
  />
);

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
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
          name="Login"
          component={LoginScreen}
          options={{title: 'Login'}}
        />
        <Stack.Screen
          name="Cadastro"
          component={CadastroScreen}
          options={{title: 'Cadastro'}}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{title: 'Dashboard'}}
        />
        <Stack.Screen
          name="Clientes"
          component={ClientesWrapper}
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
