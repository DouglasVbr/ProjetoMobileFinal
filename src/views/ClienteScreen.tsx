/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {View, ScrollView, Alert, FlatList, Text} from 'react-native';
import {FormInput} from '../components/FormInput';
import {Button} from '../components/Button';
import {Menu} from '../components/Menu';
import {globalStyles} from '../styles/globalStyles';
import {Cliente} from '../models/types';
import {ClienteStorage} from '../services/storage';

type ClienteScreenProps = {
  onLogout: () => void | Promise<void>;
};

export function ClienteScreen({onLogout}: ClienteScreenProps) {
  const [cliente, setCliente] = useState<Partial<Cliente>>({
    nome: '',
    telefone: '',
    email: '',
  });
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Cliente, string>>>(
    {},
  );

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const dados = await ClienteStorage.getAll();
      setClientes(dados);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os clientes.');
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof Cliente, string>> = {};

    if (!cliente.nome?.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!cliente.telefone?.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!cliente.email?.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(cliente.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await ClienteStorage.save(cliente as Cliente);
      Alert.alert('Sucesso', 'Cliente cadastrado com sucesso!');
      setCliente({nome: '', telefone: '', email: ''});
      carregarClientes();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar o cliente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este cliente?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await ClienteStorage.delete(id);
              carregarClientes();
              Alert.alert('Sucesso', 'Cliente excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o cliente.');
            }
          },
        },
      ],
    );
  };

  const renderCliente = ({item}: {item: Cliente}) => (
    <View style={globalStyles.card}>
      <Text style={globalStyles.title}>{item.nome}</Text>
      <Text>Telefone: {item.telefone}</Text>
      <Text>Email: {item.email}</Text>
      <View style={[globalStyles.row, {marginTop: 10}]}>
        <Button
          title="Excluir"
          onPress={() => handleDelete(item.id)}
          variant="danger"
          style={{flex: 1, marginRight: 5}}
        />
      </View>
    </View>
  );

  return (
    <View style={{flex: 1}}>
      <Menu onLogout={onLogout} />
      <ScrollView style={globalStyles.container}>
        <View style={{padding: 20}}>
          <FormInput
            label="Nome"
            value={cliente.nome}
            onChangeText={text => setCliente({...cliente, nome: text})}
            error={errors.nome}
            placeholder="Digite o nome do cliente"
          />

          <FormInput
            label="Telefone"
            value={cliente.telefone}
            onChangeText={text => setCliente({...cliente, telefone: text})}
            error={errors.telefone}
            placeholder="Digite o telefone"
            keyboardType="phone-pad"
          />

          <FormInput
            label="Email"
            value={cliente.email}
            onChangeText={text => setCliente({...cliente, email: text})}
            error={errors.email}
            placeholder="Digite o email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Button
            title="Cadastrar Cliente"
            onPress={handleSubmit}
            loading={loading}
          />

          <Text style={[globalStyles.title, {marginTop: 20}]}>
            Clientes Cadastrados
          </Text>
          <FlatList
            data={clientes}
            renderItem={renderCliente}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}
