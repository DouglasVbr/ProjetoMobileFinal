/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {View, ScrollView, Alert, FlatList, Text} from 'react-native';
import {FormInput} from '../components/FormInput';
import {Button} from '../components/Button';
import {Menu} from '../components/Menu';
import {globalStyles} from '../styles/globalStyles';
import {Servico} from '../models/types';
import {ServicoStorage} from '../services/storage';

export const ServicoScreen: React.FC = () => {
  const [servico, setServico] = useState<Partial<Servico>>({
    nome: '',
    preco: 0,
    duracao: 0,
  });
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Servico, string>>>(
    {},
  );

  useEffect(() => {
    carregarServicos();
  }, []);

  const carregarServicos = async () => {
    try {
      const dados = await ServicoStorage.getAll();
      setServicos(dados);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os serviços.');
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof Servico, string>> = {};

    if (!servico.nome?.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!servico.preco || servico.preco <= 0) {
      newErrors.preco = 'Preço deve ser maior que zero';
    }

    if (!servico.duracao || servico.duracao <= 0) {
      newErrors.duracao = 'Duração deve ser maior que zero';
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
      await ServicoStorage.save(servico as Servico);
      Alert.alert('Sucesso', 'Serviço cadastrado com sucesso!');
      setServico({nome: '', preco: 0, duracao: 0});
      carregarServicos();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar o serviço.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este serviço?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await ServicoStorage.delete(id);
              carregarServicos();
              Alert.alert('Sucesso', 'Serviço excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o serviço.');
            }
          },
        },
      ],
    );
  };

  const formatarPreco = (preco: number) => {
    return `R$ ${preco.toFixed(2)}`;
  };

  const renderServico = ({item}: {item: Servico}) => (
    <View style={globalStyles.card}>
      <Text style={globalStyles.title}>{item.nome}</Text>
      <Text>Preço: {formatarPreco(item.preco)}</Text>
      <Text>Duração: {item.duracao} minutos</Text>
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
            label="Nome do Serviço"
            value={servico.nome}
            onChangeText={text => setServico({...servico, nome: text})}
            error={errors.nome}
            placeholder="Digite o nome do serviço"
          />

          <FormInput
            label="Preço (R$)"
            value={servico.preco?.toString()}
            onChangeText={text => {
              const preco = parseFloat(text.replace(',', '.'));
              setServico({...servico, preco: isNaN(preco) ? 0 : preco});
            }}
            error={errors.preco}
            placeholder="Digite o preço"
            keyboardType="decimal-pad"
          />

          <FormInput
            label="Duração (minutos)"
            value={servico.duracao?.toString()}
            onChangeText={text => {
              const duracao = parseInt(text, 10);
              setServico({...servico, duracao: isNaN(duracao) ? 0 : duracao});
            }}
            error={errors.duracao}
            placeholder="Digite a duração em minutos"
            keyboardType="number-pad"
          />

          <Button
            title="Cadastrar Serviço"
            onPress={handleSubmit}
            loading={loading}
          />

          <Text style={[globalStyles.title, {marginTop: 20}]}>
            Serviços Cadastrados
          </Text>
          <FlatList
            data={servicos}
            renderItem={renderServico}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </View>
  );
};
