import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

function TelaLogin({navigation}: {navigation: any}) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState('');
  const [novaSenha, setNovaSenha] = useState('');

  function validarEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Preencha todos os campos!');
      return;
    }
    if (!validarEmail(email)) {
      Alert.alert('Digite um e-mail válido!');
      return;
    }
    try {
      // procura em clientes
      const clientesSnap = await firestore()
        .collection('clientes')
        .where('email', '==', email)
        .where('senha', '==', senha)
        .get();

      // procura em barbeiros se não encontrar em clientes
      const barbeirosSnap = clientesSnap.empty
        ? await firestore()
            .collection('barbeiros')
            .where('email', '==', email)
            .where('senha', '==', senha)
            .get()
        : null;

      if (!clientesSnap.empty || (barbeirosSnap && !barbeirosSnap.empty)) {
        Alert.alert('Login realizado com sucesso!');
        navigation.navigate('Servicos');
      } else {
        Alert.alert('E-mail ou senha inválidos!');
      }
    } catch (e) {
      Alert.alert('Erro ao fazer login: ' + String(e));
    }
  }

  async function handleAlterarSenha() {
    if (!emailRecuperar || !novaSenha) {
      Alert.alert('Preencha o e-mail e a nova senha!');
      return;
    }
    if (!validarEmail(emailRecuperar)) {
      Alert.alert('Digite um e-mail válido!');
      return;
    }

    const senhaForte =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!senhaForte.test(novaSenha)) {
      Alert.alert(
        'A nova senha deve conter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial.',
      );
      return;
    }

    try {
      const clientesSnap = await firestore()
        .collection('clientes')
        .where('email', '==', emailRecuperar)
        .get();

      const barbeirosSnap = clientesSnap.empty
        ? await firestore()
            .collection('barbeiros')
            .where('email', '==', emailRecuperar)
            .get()
        : null;

      let userDoc = null;
      let collection = '';

      if (!clientesSnap.empty) {
        userDoc = clientesSnap.docs[0];
        collection = 'clientes';
      } else if (barbeirosSnap && !barbeirosSnap.empty) {
        userDoc = barbeirosSnap.docs[0];
        collection = 'barbeiros';
      }

      if (userDoc && collection) {
        await firestore()
          .collection(collection)
          .doc(userDoc.id)
          .update({senha: novaSenha});
        Alert.alert('Senha alterada com sucesso!');
        setModalVisible(false);
        setEmailRecuperar('');
        setNovaSenha('');
      } else {
        Alert.alert('E-mail não encontrado!');
      }
    } catch (e) {
      Alert.alert('Erro ao alterar senha: ' + String(e));
    }
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../img/LogoPrincipal.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.titulo}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      <Button title="Entrar" onPress={handleLogin} />

      <TouchableOpacity
        style={styles.link}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.linkText}>Esqueceu ou deseja alterar a senha?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Alterar Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              value={emailRecuperar}
              onChangeText={setEmailRecuperar}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Nova Senha"
              value={novaSenha}
              onChangeText={setNovaSenha}
              secureTextEntry
            />
            <Button title="Alterar Senha" onPress={handleAlterarSenha} />
            <TouchableOpacity
              style={styles.link}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.linkText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#222',
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  link: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#007bff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#222',
  },
});

export default TelaLogin;
