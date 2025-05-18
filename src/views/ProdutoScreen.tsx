/* eslint-disable radix */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {View, ScrollView, Alert, FlatList, Text} from 'react-native';
import {FormInput} from '../components/FormInput';
import {Button} from '../components/Button';
import {Menu} from '../components/Menu';
import {globalStyles} from '../styles/globalStyles';
import {Produto} from '../models/types';
import {ProdutoStorage} from '../services/storage';

export const ProdutoScreen: React.FC = () => {
  const [produto, setProduto] = useState<Partial<Produto>>({
    nome: '',
    preco: 0,
    quantidade: 0,
    descricao: '',
  });
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Produto, string>>>(
    {},
  );

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const dados = await ProdutoStorage.getAll();
      setProdutos(dados);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof Produto, string>> = {};

    if (!produto.nome?.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!produto.preco || produto.preco <= 0) {
      newErrors.preco = 'Preço deve ser maior que zero';
    }

    if (!produto.quantidade || produto.quantidade < 0) {
      newErrors.quantidade = 'Quantidade não pode ser negativa';
    }

    if (!produto.descricao?.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
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
      await ProdutoStorage.save(produto as Produto);
      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
      setProduto({
        nome: '',
        preco: 0,
        quantidade: 0,
        descricao: '',
      });
      carregarProdutos();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar o produto.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este produto?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await ProdutoStorage.delete(id);
              carregarProdutos();
              Alert.alert('Sucesso', 'Produto excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o produto.');
            }
          },
        },
      ],
    );
  };

  const formatarPreco = (preco: number) => {
    return `R$ ${preco.toFixed(2)}`;
  };

  const renderProduto = ({item}: {item: Produto}) => (
    <View style={globalStyles.card}>
      <Text style={globalStyles.title}>{item.nome}</Text>
      <Text>Preço: {formatarPreco(item.preco)}</Text>
      <Text>Quantidade: {item.quantidade}</Text>
      <Text>Descrição: {item.descricao}</Text>
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
            label="Nome do Produto"
            value={produto.nome}
            onChangeText={text => setProduto({...produto, nome: text})}
            error={errors.nome}
            placeholder="Digite o nome do produto"
          />

          <FormInput
            label="Preço (R$)"
            value={produto.preco?.toString()}
            onChangeText={text => {
              const preco = parseFloat(text.replace(',', '.'));
              setProduto({...produto, preco: isNaN(preco) ? 0 : preco});
            }}
            error={errors.preco}
            placeholder="Digite o preço"
            keyboardType="decimal-pad"
          />

          <FormInput
            label="Quantidade"
            value={produto.quantidade?.toString()}
            onChangeText={text => {
              const quantidade = parseInt(text);
              setProduto({
                ...produto,
                quantidade: isNaN(quantidade) ? 0 : quantidade,
              });
            }}
            error={errors.quantidade}
            placeholder="Digite a quantidade"
            keyboardType="number-pad"
          />

          <FormInput
            label="Descrição"
            value={produto.descricao}
            onChangeText={text => setProduto({...produto, descricao: text})}
            error={errors.descricao}
            placeholder="Digite a descrição do produto"
            multiline
            numberOfLines={3}
          />

          <Button
            title="Cadastrar Produto"
            onPress={handleSubmit}
            loading={loading}
          />

          <Text style={[globalStyles.title, {marginTop: 20}]}>
            Produtos Cadastrados
          </Text>
          <FlatList
            data={produtos}
            renderItem={renderProduto}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </View>
  );
};
