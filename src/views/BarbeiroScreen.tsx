/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {View, ScrollView, Alert, FlatList, Text, Switch} from 'react-native';
import {FormInput} from '../components/FormInput';
import {Button} from '../components/Button';
import {Menu} from '../components/Menu';
import {globalStyles} from '../styles/globalStyles';
import {Barbeiro} from '../models/types';
import {BarbeiroStorage} from '../services/storage';

export const BarbeiroScreen: React.FC = () => {
  const [barbeiro, setBarbeiro] = useState<Partial<Barbeiro>>({
    nome: '',
    especialidade: '',
    disponibilidade: true,
    servicos: [],
  });
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Barbeiro, string>>>(
    {},
  );

  useEffect(() => {
    carregarBarbeiros();
  }, []);

  const carregarBarbeiros = async () => {
    try {
      const dados = await BarbeiroStorage.getAll();
      setBarbeiros(dados);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os barbeiros.');
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof Barbeiro, string>> = {};

    if (!barbeiro.nome?.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!barbeiro.especialidade?.trim()) {
      newErrors.especialidade = 'Especialidade é obrigatória';
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
      await BarbeiroStorage.save(barbeiro as Barbeiro);
      Alert.alert('Sucesso', 'Barbeiro cadastrado com sucesso!');
      setBarbeiro({
        nome: '',
        especialidade: '',
        disponibilidade: true,
        servicos: [],
      });
      carregarBarbeiros();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar o barbeiro.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este barbeiro?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await BarbeiroStorage.delete(id);
              carregarBarbeiros();
              Alert.alert('Sucesso', 'Barbeiro excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o barbeiro.');
            }
          },
        },
      ],
    );
  };

  const renderBarbeiro = ({item}: {item: Barbeiro}) => (
    <View style={globalStyles.card}>
      <Text style={globalStyles.title}>{item.nome}</Text>
      <Text>Especialidade: {item.especialidade}</Text>
      <Text>
        Status: {item.disponibilidade ? 'Disponível' : 'Indisponível'}
      </Text>
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
      <Menu />
      <ScrollView style={globalStyles.container}>
        <View style={{padding: 20}}>
          <FormInput
            label="Nome do Barbeiro"
            value={barbeiro.nome}
            onChangeText={text => setBarbeiro({...barbeiro, nome: text})}
            error={errors.nome}
            placeholder="Digite o nome do barbeiro"
          />

          <FormInput
            label="Especialidade"
            value={barbeiro.especialidade}
            onChangeText={text =>
              setBarbeiro({...barbeiro, especialidade: text})
            }
            error={errors.especialidade}
            placeholder="Digite a especialidade"
          />

          <View style={[globalStyles.row, {marginVertical: 16}]}>
            <Text style={globalStyles.label}>Disponibilidade</Text>
            <Switch
              value={barbeiro.disponibilidade}
              onValueChange={value =>
                setBarbeiro({...barbeiro, disponibilidade: value})
              }
            />
          </View>

          <Button
            title="Cadastrar Barbeiro"
            onPress={handleSubmit}
            loading={loading}
          />

          <Text style={[globalStyles.title, {marginTop: 20}]}>
            Barbeiros Cadastrados
          </Text>
          <FlatList
            data={barbeiros}
            renderItem={renderBarbeiro}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </View>
  );
};
