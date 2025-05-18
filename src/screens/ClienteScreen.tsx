import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
// @ts-ignore
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/ClienteScreenStyles';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
}

export default function ClienteScreen() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [editando, setEditando] = useState<string | null>(null);

  useEffect(() => {
    carregarClientes();
  }, []);

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
    setEditando(null);
  }

  function handleEditar(cliente: Cliente) {
    setNome(cliente.nome);
    setTelefone(cliente.telefone);
    setEmail(cliente.email);
    setEditando(cliente.id);
  }

  function handleExcluir(id: string) {
    Alert.alert('Excluir', 'Deseja realmente excluir este cliente?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          const novos = clientes.filter(c => c.id !== id);
          await salvarClientes(novos);
        },
      },
    ]);
  }

  async function handleSalvar() {
    if (!nome || !telefone || !email) {
      Alert.alert('Preencha todos os campos!');
      return;
    }
    if (editando) {
      const novos = clientes.map(c =>
        c.id === editando ? {id: editando, nome, telefone, email} : c,
      );
      await salvarClientes(novos);
    } else {
      const novo: Cliente = {id: Date.now().toString(), nome, telefone, email};
      await salvarClientes([...clientes, novo]);
    }
    limparCampos();
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
      <Button
        title={editando ? 'Salvar Alteração' : 'Cadastrar'}
        onPress={handleSalvar}
      />
      {editando && (
        <Button title="Cancelar" color="gray" onPress={limparCampos} />
      )}
      <Text style={styles.tituloLista}>Clientes Cadastrados</Text>
      <FlatList
        data={clientes}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.item}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text>
              {item.telefone} | {item.email}
            </Text>
            <View style={styles.botoes}>
              <TouchableOpacity
                onPress={() => handleEditar(item)}
                style={styles.botaoEditar}>
                <Text style={styles.textoBotao}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleExcluir(item.id)}
                style={styles.botaoExcluir}>
                <Text style={styles.textoBotao}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
