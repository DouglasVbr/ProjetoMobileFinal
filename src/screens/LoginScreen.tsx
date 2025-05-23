import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  ImageBackground,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Cadastro: undefined;
  Clientes: undefined;
  Agendamento: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigation = useNavigation<NavigationProp>();

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      // Verifica se é o barbeiro padrão
      if (email === 'teste123@gmail.com' && senha === 'Ab123!') {
        await AsyncStorage.setItem(
          '@barbearia_user',
          JSON.stringify({
            email,
            tipo: 'barbeiro',
          }),
        );
        navigation.navigate('Clientes');
        return;
      }

      // Busca usuários cadastrados
      const users = await AsyncStorage.getItem('@barbearia_users');
      const parsedUsers = users ? JSON.parse(users) : [];

      // Procura o usuário
      const user = parsedUsers.find(
        (u: any) => u.email === email && u.senha === senha,
      );

      if (user) {
        await AsyncStorage.setItem('@barbearia_user', JSON.stringify(user));
        if (user.tipo === 'barbeiro') {
          navigation.navigate('Clientes');
        } else {
          navigation.navigate('Agendamento');
        }
      } else {
        Alert.alert('Erro', 'Email ou senha inválidos');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao fazer login');
    }
  };

  return (
    <ImageBackground
      source={require('../img/fundo.jpeg')}
      style={styles.backgroundImage}
      resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image
            source={require('../img/LogoPrincipal.png')}
            style={styles.logo}
          />

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#666"
            />

            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              placeholderTextColor="#666"
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Cadastro')}>
              <Text style={styles.registerText}>
                Não tem uma conta? Cadastre-se
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 30,
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  button: {
    backgroundColor: '#D4AF37',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
  },
});
