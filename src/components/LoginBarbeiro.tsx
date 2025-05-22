import React, {useState, useEffect} from 'react';
import {View, ScrollView, Alert, FlatList, Text, Switch} from 'react-native';
import {FormInput} from './FormInput';
import {Button} from './Button';
import {Menu} from './Menu';
import {globalStyles} from '../styles/globalStyles';
import firestore from '@react-native-firebase/firestore';

interface Barbeiro {
  id: string;
  nome: string;
  especialidade: string;
  disponibilidade: boolean;
  servicos: string[];
}

export const BarbeiroScreen: React.FC = () => {
  const [barbeiro, setBarbeiro] = useState<Omit<Barbeiro, 'id'>>({
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
    carregarBarbeirosFirestore();
  }, []);

  const carregarBarbeirosFirestore = async () => {
    try {
      const snapshot = await firestore().collection('barbeiros').get();
      const lista: Barbeiro[] = [];
      snapshot.forEach(doc => {
        lista.push({ id: doc.id, ...doc.data() } as Barbeiro);
      });
      setBarbeiros(lista);
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
      await firestore().collection('barbeiros').add(barbeiro);
      Alert.alert('Sucesso', 'Barbeiro cadastrado com sucesso!');
      setBarbeiro({
        nome: '',
        especialidade: '',
        disponibilidade: true,
        servicos: [],
      });
      carregarBarbeirosFirestore();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar o barbeiro.');
    } finally {
      setLoading(false);
    }
  };

  const renderBarbeiro = ({item}: {item: Barbeiro}) => (
    <View style={globalStyles.card}>
      <Text style={globalStyles.title}>{item.nome}</Text>
      <Text>Especialidade: {item.especialidade}</Text>
      <Text>
        Status: {item.disponibilidade ? 'Disponível' : 'Indisponível'}
      </Text>
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