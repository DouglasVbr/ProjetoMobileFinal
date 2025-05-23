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
  Login: undefined;
  Cadastro: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CadastroScreen = () => {
  const [tipoCadastro, setTipoCadastro] = useState<
    'cliente' | 'barbeiro' | null
  >(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigation = useNavigation<NavigationProp>();

  const validateEmail = (emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const validatePassword = (password: string) => {
    // Mínimo 8 caracteres, pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleCadastro = async () => {
    if (!tipoCadastro || !nome || !email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    if (!validatePassword(senha)) {
      Alert.alert(
        'Erro',
        'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais',
      );
      return;
    }

    try {
      const users = await AsyncStorage.getItem('@barbearia_users');
      const parsedUsers = users ? JSON.parse(users) : [];

      // Verifica se o email já está cadastrado
      const emailExists = parsedUsers.some((u: any) => u.email === email);

      if (emailExists) {
        Alert.alert('Erro', 'Este email já está cadastrado');
        return;
      }

      // Cria o novo usuário
      const newUser = {
        nome,
        email,
        senha,
        tipo: tipoCadastro,
      };

      // Adiciona o novo usuário à lista
      parsedUsers.push(newUser);

      // Salva a lista atualizada
      await AsyncStorage.setItem(
        '@barbearia_users',
        JSON.stringify(parsedUsers),
      );

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao realizar o cadastro');
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
            <View style={styles.tipoCadastroContainer}>
              <TouchableOpacity
                style={[
                  styles.tipoCadastroButton,
                  tipoCadastro === 'cliente' &&
                    styles.tipoCadastroButtonSelected,
                ]}
                onPress={() => setTipoCadastro('cliente')}>
                <Text
                  style={[
                    styles.tipoCadastroText,
                    tipoCadastro === 'cliente' &&
                      styles.tipoCadastroTextSelected,
                  ]}>
                  Cliente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tipoCadastroButton,
                  tipoCadastro === 'barbeiro' &&
                    styles.tipoCadastroButtonSelected,
                ]}
                onPress={() => setTipoCadastro('barbeiro')}>
                <Text
                  style={[
                    styles.tipoCadastroText,
                    tipoCadastro === 'barbeiro' &&
                      styles.tipoCadastroTextSelected,
                  ]}>
                  Barbeiro
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              value={nome}
              onChangeText={setNome}
              placeholderTextColor="#666"
            />

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

            <TouchableOpacity
              style={styles.button}
              onPress={handleCadastro}
              disabled={!tipoCadastro}>
              <Text style={styles.buttonText}>Cadastrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Já tem uma conta? Faça login</Text>
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
  tipoCadastroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tipoCadastroButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  tipoCadastroButtonSelected: {
    backgroundColor: '#D4AF37',
  },
  tipoCadastroText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipoCadastroTextSelected: {
    color: '#fff',
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
  loginButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
  },
});
