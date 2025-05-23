import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/AppNavigator';
import {StackNavigationProp} from '@react-navigation/stack';

type TestesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

const TelaTestes = () => {
  const navigation = useNavigation<TestesScreenNavigationProp>();
  const [textoInput, setTextoInput] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);
  const [switchAtivo, setSwitchAtivo] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Tela de Testes de Componentes</Text>

      {/* Seção de Navegação */}
      <View style={styles.sessao}>
        <Text style={styles.subtitulo}>Navegação</Text>
        <Button
          title="Ir para Login"
          onPress={() => navigation.navigate('Login')}
        />
        <View style={styles.espacador} />
        <Button
          title="Ir para Cadastro"
          onPress={() => navigation.navigate('Cadastro')}
        />
        <View style={styles.espacador} />
        <Button
          title="Ir para Dashboard"
          onPress={() => navigation.navigate('Dashboard')}
        />
      </View>

      {/* Input de texto */}
      <View style={styles.sessao}>
        <Text style={styles.subtitulo}>TextInput</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite algo..."
          value={textoInput}
          onChangeText={setTextoInput}
        />
        <Text>Texto digitado: {textoInput}</Text>
      </View>

      {/* Botões */}
      <View style={styles.sessao}>
        <Text style={styles.subtitulo}>Botões</Text>
        <Button
          title="Botão Padrão"
          onPress={() => Alert.alert('Botão pressionado!')}
        />
        <View style={styles.espacador} />
        <TouchableOpacity
          style={styles.botaoCustom}
          onPress={() => Alert.alert('TouchableOpacity pressionado')}>
          <Text style={styles.textoBotao}>Botão Customizado</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <View style={styles.sessao}>
        <Text style={styles.subtitulo}>Modal</Text>
        <Button title="Abrir Modal" onPress={() => setModalVisivel(true)} />
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisivel}
          onRequestClose={() => setModalVisivel(false)}>
          <View style={styles.modalFundo}>
            <View style={styles.modalConteudo}>
              <Text>Este é um Modal de teste</Text>
              <Button title="Fechar" onPress={() => setModalVisivel(false)} />
            </View>
          </View>
        </Modal>
      </View>

      {/* Alert */}
      <View style={styles.sessao}>
        <Text style={styles.subtitulo}>Alert</Text>
        <Button
          title="Mostrar Alert"
          onPress={() =>
            Alert.alert(
              'Título do Alert',
              'Esta é uma mensagem de alerta padrão.',
              [
                {text: 'Cancelar', style: 'cancel'},
                {text: 'OK', onPress: () => console.log('OK Pressed')},
              ],
            )
          }
        />
      </View>

      {/* Switch Simulado */}
      <View style={styles.sessao}>
        <Text style={styles.subtitulo}>Switch Simulado</Text>
        <TouchableOpacity
          style={[styles.switchContainer, switchAtivo && styles.switchAtivo]}
          onPress={() => setSwitchAtivo(!switchAtivo)}>
          <View
            style={[
              styles.switchCircle,
              switchAtivo && styles.switchCircleAtivo,
            ]}
          />
        </TouchableOpacity>
        <Text>Estado: {switchAtivo ? 'Ativo' : 'Inativo'}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2196F3',
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2196F3',
  },
  sessao: {
    width: '100%',
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#2196F3',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  botaoCustom: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  textoBotao: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalFundo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalConteudo: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  espacador: {
    height: 10,
  },
  switchContainer: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    padding: 3,
    marginBottom: 10,
  },
  switchAtivo: {
    backgroundColor: '#4CAF50',
  },
  switchCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  switchCircleAtivo: {
    transform: [{translateX: 20}],
  },
});

export default TelaTestes;
