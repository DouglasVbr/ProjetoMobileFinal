import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import styles from '../styles/ClienteScreenStyles';

interface Pessoa {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  senha: string;
  tipo: 'cliente' | 'barbeiro';
}

function Cadastro({navigation}: {navigation: any}) {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tipo, setTipo] = useState<'cliente' | 'barbeiro'>('cliente');
  const [editando, setEditando] = useState<string | null>(null);
  const [erros, setErros] = useState({
    nome: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });

  const carregarPessoasFirestore = useCallback(async () => {
    try {
      const clientesSnap = await firestore().collection('clientes').get();
      const barbeirosSnap = await firestore().collection('barbeiros').get();
      const lista: Pessoa[] = [];

      clientesSnap.forEach(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          lista.push({id: doc.id, ...doc.data(), tipo: 'cliente'} as Pessoa);
        },
      );
      barbeirosSnap.forEach(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          lista.push({id: doc.id, ...doc.data(), tipo: 'barbeiro'} as Pessoa);
        },
      );

      setPessoas(lista);
      await AsyncStorage.setItem('pessoas', JSON.stringify(lista));
    } catch (error) {
      carregarPessoas();
    }
  }, []);

  useEffect(() => {
    carregarPessoasFirestore();
  }, [carregarPessoasFirestore]);

  async function carregarPessoas() {
    const data = await AsyncStorage.getItem('pessoas');
    if (data) {
      setPessoas(JSON.parse(data));
    }
  }

  async function salvarPessoas(novasPessoas: Pessoa[]) {
    await AsyncStorage.setItem('pessoas', JSON.stringify(novasPessoas));
    setPessoas(novasPessoas);
  }

  function validarNome(nome: string) {
    return nome.trim().length >= 3;
  }

  function limparErros() {
    setErros({
      nome: '',
      telefone: '',
      email: '',
      senha: '',
      confirmarSenha: '',
    });
  }

  function limparCampos() {
    setNome('');
    setTelefone('');
    setEmail('');
    setSenha('');
    setConfirmarSenha('');
    setTipo('cliente');
    setEditando(null);
    limparErros();
  }

  function validarEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validarSenha(senha: string) {
    // Pelo menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial (exceto [])
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s\[\]])[A-Za-z\d\W_]{8,}$/.test(
      senha,
    );
  }

  function validarTelefone(telefone: string) {
    // Remove caracteres não numéricos
    const numeroLimpo = telefone.replace(/\D/g, '');
    // Verifica se tem entre 10 e 11 dígitos (com DDD)
    return numeroLimpo.length >= 10 && numeroLimpo.length <= 11;
  }

  async function handleSalvar() {
    limparErros();
    let temErro = false;
    const novosErros = {...erros};

    if (!nome || !validarNome(nome)) {
      novosErros.nome = 'Nome deve ter pelo menos 3 caracteres';
      temErro = true;
    }

    if (!telefone || !validarTelefone(telefone)) {
      novosErros.telefone = 'Telefone inválido';
      temErro = true;
    }

    if (!email || !validarEmail(email)) {
      novosErros.email = 'E-mail inválido';
      temErro = true;
    }

    if (!senha || !validarSenha(senha)) {
      novosErros.senha =
        'Senha deve conter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial';
      temErro = true;
    }

    if (!confirmarSenha || senha !== confirmarSenha) {
      novosErros.confirmarSenha = 'As senhas não coincidem';
      temErro = true;
    }

    if (temErro) {
      setErros(novosErros);
      return;
    }

    // Validação para não permitir e-mail repetido
    try {
      const emailExisteCliente = await firestore()
        .collection('clientes')
        .where('email', '==', email)
        .get();
      const emailExisteBarbeiro = await firestore()
        .collection('barbeiros')
        .where('email', '==', email)
        .get();

      if (
        (!editando &&
          (!emailExisteCliente.empty || !emailExisteBarbeiro.empty)) ||
        (editando && pessoas.some(p => p.email === email && p.id !== editando))
      ) {
        Alert.alert('Este e-mail já está cadastrado!');
        return;
      }
    } catch (e) {
      Alert.alert('Erro ao verificar e-mail: ' + String(e));
      return;
    }

    if (editando) {
      const novos = pessoas.map(p =>
        p.id === editando
          ? {id: editando, nome, telefone, email, senha, tipo}
          : p,
      );
      await salvarPessoas(novos);
      try {
        await firestore()
          .collection(tipo === 'cliente' ? 'clientes' : 'barbeiros')
          .doc(editando)
          .update({nome, telefone, email, senha});
        Alert.alert('Cadastro alterado com sucesso!');
      } catch (e) {
        Alert.alert('Erro ao atualizar no Firebase: ' + String(e));
      }
    } else {
      const novo: Pessoa = {
        id: Date.now().toString(),
        nome,
        telefone,
        email,
        senha,
        tipo,
      };
      await salvarPessoas([...pessoas, novo]);
      try {
        const docRef = await firestore()
          .collection(tipo === 'cliente' ? 'clientes' : 'barbeiros')
          .add({nome, telefone, email, senha});
        const atualizado = [
          ...pessoas,
          {id: docRef.id, nome, telefone, email, senha, tipo},
        ];
        await salvarPessoas(atualizado);
        Alert.alert('Cadastro realizado com sucesso!');
        // Redireciona para a tela de login após cadastro bem-sucedido
        navigation.navigate('TelaLogin'); //
      } catch (e) {
        Alert.alert('Erro ao cadastrar no Firebase: ' + String(e));
      }
    }
    limparCampos();
    carregarPessoasFirestore();
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../img/LogoPrincipal.png')}
        style={{width: 120, height: 120, marginBottom: 20}}
        resizeMode="contain"
      />
      <Text style={styles.titulo}>Cadastro</Text>
      <View style={estilos.tipoContainer}>
        <TouchableOpacity
          style={[
            estilos.tipoBotao,
            tipo === 'cliente' && estilos.tipoBotaoSelecionado,
          ]}
          onPress={() => setTipo('cliente')}>
          <Text
            style={[
              estilos.tipoTexto,
              tipo === 'cliente' && estilos.tipoTextoSelecionado,
            ]}>
            Cliente
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            estilos.tipoBotao,
            tipo === 'barbeiro' && estilos.tipoBotaoSelecionado,
          ]}
          onPress={() => setTipo('barbeiro')}>
          <Text
            style={[
              estilos.tipoTexto,
              tipo === 'barbeiro' && estilos.tipoTextoSelecionado,
            ]}>
            Barbeiro
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={[styles.input, erros.nome ? estilos.inputError : null]}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      {erros.nome ? <Text style={estilos.erroTexto}>{erros.nome}</Text> : null}

      <TextInput
        style={[styles.input, erros.telefone ? estilos.inputError : null]}
        placeholder="Telefone"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
      />
      {erros.telefone ? (
        <Text style={estilos.erroTexto}>{erros.telefone}</Text>
      ) : null}

      <TextInput
        style={[styles.input, erros.email ? estilos.inputError : null]}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {erros.email ? (
        <Text style={estilos.erroTexto}>{erros.email}</Text>
      ) : null}

      <TextInput
        style={[styles.input, erros.senha ? estilos.inputError : null]}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      {erros.senha ? (
        <Text style={estilos.erroTexto}>{erros.senha}</Text>
      ) : null}

      <TextInput
        style={[styles.input, erros.confirmarSenha ? estilos.inputError : null]}
        placeholder="Confirmar Senha"
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        secureTextEntry
      />
      {erros.confirmarSenha ? (
        <Text style={estilos.erroTexto}>{erros.confirmarSenha}</Text>
      ) : null}

      <Button
        title={editando ? 'Salvar Alteração' : 'Cadastrar'}
        onPress={handleSalvar}
      />
      <Text style={styles.tituloLista}>Cadastrados</Text>
      <FlatList
        data={pessoas}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.item}>
            <Text style={styles.nome}>
              {item.nome} ({item.tipo})
            </Text>
            <Text>
              {item.telefone} | {item.email}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tipoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tipoBotao: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
    marginHorizontal: 10,
    backgroundColor: '#fff',
  },
  tipoBotaoSelecionado: {
    backgroundColor: '#222',
  },
  tipoTexto: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tipoTextoSelecionado: {
    color: '#fff',
  },
  inputError: {
    borderColor: '#ff0000',
    borderWidth: 1,
  },
  erroTexto: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: -15,
    marginBottom: 10,
    marginLeft: 10,
  },
});

export default Cadastro;
