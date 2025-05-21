import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
} from 'react-native';
// @ts-ignore
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import styles from '../styles/ClienteScreenStyles';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  senha: string;
}

export default function ClienteScreen() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [editando, setEditando] = useState<string | null>(null);

  useEffect(() => {
    carregarClientesFirestore();
  }, []);

  async function carregarClientesFirestore() {
    try {
      const snapshot = await firestore().collection('clientes').get();
      const lista: Cliente[] = [];
      snapshot.forEach(doc => {
        lista.push({ id: doc.id, ...doc.data() } as Cliente);
      });
      setClientes(lista);
      await AsyncStorage.setItem('clientes', JSON.stringify(lista));
    } catch (error) {
      carregarClientes();
    }
  }

  async function carregarClientes() {
    const data = await AsyncStorage.getItem('clientes');
    if (data) {
      setClientes(JSON.parse(data));
    }
  }

  async function salvarClientes(novosClientes: Cliente[]) {
    await AsyncStorage.setItem('clientes', JSON.stringify(novosClientes));
    setClientes(novosClientes);
  }

  function limparCampos() {
    setNome('');
    setTelefone('');
    setEmail('');
    setSenha('');
    setEditando(null);
  }

  async function handleSalvar() {
    if (!nome || !telefone || !email || !senha) {
      Alert.alert('Preencha todos os campos!');
      return;
    }
    if (editando) {
      const novos = clientes.map(c =>
        c.id === editando ? { id: editando, nome, telefone, email, senha } : c,
      );
      await salvarClientes(novos);
      try {
        await firestore().collection('clientes').doc(editando).update({ nome, telefone, email, senha });
        Alert.alert('Cliente alterado com sucesso!');
      } catch (e) {
        Alert.alert('Erro ao atualizar no Firebase: ' + String(e));
      }
    } else {
      const novo: Cliente = { id: Date.now().toString(), nome, telefone, email, senha };
      await salvarClientes([...clientes, novo]);
      try {
        const docRef = await firestore().collection('clientes').add({ nome, telefone, email, senha });
        const atualizado = [...clientes, { id: docRef.id, nome, telefone, email, senha }];
        await salvarClientes(atualizado);
        Alert.alert('Cliente cadastrado com sucesso!');
      } catch (e) {
        Alert.alert('Erro ao cadastrar no Firebase: ' + String(e));
      }
    }
    limparCampos();
    carregarClientesFirestore();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastro de Clientes</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      <Button
        title={editando ? 'Salvar Alteração' : 'Cadastrar'}
        onPress={handleSalvar}
      />
      <Text style={styles.tituloLista}>Clientes Cadastrados</Text>
      <FlatList
        data={clientes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text>
              {item.telefone} | {item.email}
            </Text>
          </View>
        )}
      />
    </View>
  );
}