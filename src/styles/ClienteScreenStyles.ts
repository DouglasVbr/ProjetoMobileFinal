// Este arquivo será movido para BarbeariaApp/src/styles/ClienteScreenStyles.ts

import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#fff'},
  titulo: {fontSize: 22, fontWeight: 'bold', marginBottom: 10},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginBottom: 8,
  },
  tituloLista: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 5,
    marginBottom: 8,
  },
  nome: {fontWeight: 'bold', fontSize: 16},
  botoes: {flexDirection: 'row', marginTop: 8},
  botaoEditar: {
    marginRight: 10,
    backgroundColor: '#4caf50',
    padding: 6,
    borderRadius: 4,
  },
  botaoExcluir: {backgroundColor: '#f44336', padding: 6, borderRadius: 4},
  textoBotao: {color: '#fff', fontWeight: 'bold'},
});

export default styles;
