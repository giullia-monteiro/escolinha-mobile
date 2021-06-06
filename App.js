import 'react-native-gesture-handler';

import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, TextInput, Alert } from 'react-native';
import { NavigationContainer, useNavigation, StackActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack'

import axios from 'axios'

import EscolinhaLogo from './assets/escolinha.png'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

const baseURL = 'https://escolinha-backend.herokuapp.com'

export default function App() {

  // props propagation
  const [jwt, setJWT] = useState({ token: null })

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home">
          {() => <HomeScreen setJWT={setJWT} />}
        </Stack.Screen>
        <Stack.Screen name="AppTabs">
          {() => <AppTabs setJWT={setJWT} jwt={jwt} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const AppTabs = ({ setJWT, jwt }) => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Cadastrar">
        {() => <CadastrarScreen setJWT={setJWT} jwt={jwt} />}
      </Tab.Screen>
      <Tab.Screen name="Listar">
        {() => <ListarScreen jwt={jwt} />}
      </Tab.Screen>
    </Tab.Navigator>
  )
}

const HomeScreen = ({ setJWT }) => {

  const navigation = useNavigation();

  const [ra, setRa] = useState('')
  const [senha, setSenha] = useState('')

  const validations = () => {
    const errors = []

    if (ra.trim() == "")
      errors.push('RA vazio')

    else if (ra.trim().length != 5)
      errors.push('\nO RA deve conter cinco digitos')

    else if (senha.trim() == "")
      errors.push('\nSenha vazia')

    return [errors.length === 0, errors]
  }

  const login = () => {
    const [validation, errors] = validations()

    if (!validation) {
      Alert.alert('Login Inválido', errors.toString())
      return
    }

    axios({
      url: `${baseURL}/verify`,
      method: 'POST',
      data: { ra, senha }
    }).then(res => {
      if (res.data.token) {

        setJWT({ token: res.data.token })

        navigation.dispatch(StackActions.replace('AppTabs'))
      }
      else {
        Alert.alert('Login Inválido', `Não foi possivel fazer a autenticação para o RA: ${ra}!`)
      }

    }).catch(err => {
      console.log(err)
      const responseData = err.response.data

      if (!responseData.ra) {
        Alert.alert('Login Inválido', `O usuário com o RA: ${ra} não está cadastrado!`)
        return
      }

      if (!responseData.senha) {
        Alert.alert('Login Inválido', `Sua senha está errada!`)
        return
      }
    })
  }

  return (
    <View style={styles.container}>
      <Image source={EscolinhaLogo} style={styles.homeImage} />
      <Text style={styles.homeTile}>Faça seu login</Text>
      <View>
        <View style={styles.inputView}>
          <Text style={styles.inputLabel}>RA</Text>
          <TextInput
            style={styles.input}
            value={ra}
            onChangeText={val => setRa(val)}
            keyboardType='number-pad'
          />
        </View>
        <View style={styles.inputView}>
          <Text style={styles.inputLabel}>Senha</Text>
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={val => setSenha(val)}
            secureTextEntry
          />
        </View>
      </View>
      <TouchableOpacity
        style={{ ...styles.button, ...styles.homeButton }}
        activeOpacity={.7}
        onPress={() => login()}
      >
        <Text style={styles.buttonText}> ENTRAR </Text>
      </TouchableOpacity>
    </View>
  )
}

const CadastrarScreen = ({ setJWT, jwt }) => {

  const navigation = useNavigation();

  const [ra, setRa] = useState('')
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [rSenha, setRSenha] = useState('')

  const validations = () => {
    const errors = []

    if (nome.trim() == "")
    errors.push('Nome vazio')

    else if (nome.split(" ").length < 2)
      errors.push('\nVoce deve colocar nome e sobre nome')

    else if (ra.trim() == "")
      errors.push('RA vazio')

    else if (ra.trim().length != 5)
      errors.push('\nO RA deve conter cinco digitos')

    else if (senha.trim() == "")
      errors.push('\nSenha vazia')

    else if (senha.trim().length < 6)
      errors.push('\nA senha deve conter pelo menos 6 caracteres')

    else if (rSenha.trim() != senha.trim())
      errors.push('\nA senhas não condizem')

    return [errors.length === 0, errors]
  }

  const cadastrar = () => {
    const [validation, errors] = validations()

    if (!validation) {
      Alert.alert('Cadastro Inválido', errors.toString())
      return
    }

    axios({
      url: `${baseURL}/alunos`,
      method: 'POST',
      data: {
        ra,
        nome,
        senha
      },
      headers: {
        Authorization: `Bearer ${jwt.token}`
      }
    }).then(_ => {

      Alert.alert('Aluno Cadastrado', `o aluno ${nome} foi cadastrado!`)

    }).catch(err => {

      Alert.alert('Erro ao cadatrar aluno', `Não foi possivel cadastrar o aluno no banco de dados`)

    })
  }

  const logout = () => {

    setJWT({ token: null })
    navigation.dispatch(StackActions.replace('Home'))
  }

  return (
    <View style={styles.tabContainer}>
      <Text style={styles.tabTitle}>Cadastrar Pedido</Text>
      <View style={styles.cadastrarForm}>
        <View style={styles.inputView}>
          <Text style={styles.inputLabel}>Nome</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={val => setNome(val)}
          />
        </View>
        <View style={styles.inputView}>
          <Text style={styles.inputLabel}>RA</Text>
          <TextInput
            style={styles.input}
            value={ra}
            onChangeText={val => setRa(val)}
            keyboardType='number-pad'
          />
        </View>
        <View style={styles.inputView}>
          <Text style={styles.inputLabel}>Senha</Text>
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={val => setSenha(val)}
            secureTextEntry
          />
        </View>
        <View style={styles.inputView}>
          <Text style={styles.inputLabel}>Repita sua senha</Text>
          <TextInput
            style={styles.input}
            value={rSenha}
            onChangeText={val => setRSenha(val)}
            secureTextEntry
          />
        </View>
      </View>
      <TouchableOpacity
        style={{ ...styles.button, ...styles.cadastrarButton }}
        activeOpacity={.7}
        onPress={() => cadastrar()}
      >
        <Text style={styles.buttonText}> CADASTRAR </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ ...styles.button, ...styles.cadastrarButton }}
        activeOpacity={.7}
        onPress={() => logout()}
      >
        <Text style={styles.buttonText}> SAIR DO APP </Text>
      </TouchableOpacity>
    </View>
  )
}

const ListarScreen = ({ jwt }) => {

  const [alunos, setAlunos] = useState([{}])
  const [load, setLoading] = useState(false)

  useEffect(() => getAlunos())

  const getAlunos = () => {

    axios({
      url: `${baseURL}/alunos`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt.token}`
      }
    })
      .then(res => {
        setAlunos(res.data)
        setLoading(true)
      })
      .catch(err => Alert.alert('Erro ao carregar alunos', err))
  }

  const atualizar = () => {
    setLoading(false)
    getAlunos()
  }

  return (
    <View style={styles.tabContainer}>
      <Text style={styles.tabTitle}>Alunos</Text>
      <View style={styles.listarContainer}>
        {
          load
            ?
            Object.values(alunos).map((aluno, i) => (
              <View key={i + aluno.id} style={styles.cardAluno}>
                <Text style={styles.tituloCardAluno}>{`${aluno.nome}`}</Text>
                <Text>{`RA: ${aluno.ra}`}</Text>
              </View>
            ))
            :
            <Text style={styles.tituloCardAluno}>Carregando...</Text>
        }
      </View>
      <TouchableOpacity
        style={{ ...styles.button, ...styles.atualizarButton }}
        activeOpacity={.7}
        onPress={() => atualizar()}
      >
        <Text style={styles.buttonText}> ATUALIZAR </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24
  },
  tabContainer: {
    flex: 1,
    display: 'flex',
    backgroundColor: '#fff',
    paddingTop: 54,
    paddingHorizontal: 24
  },
  tabTitle: {
    fontSize: 24,
    color: '#46609e',
    fontWeight: 'bold'
  },
  homeImage: {
    width: 170,
    height: 150,
    resizeMode: 'stretch',
    alignSelf: 'center',
    marginBottom: 24
  },
  homeTile: {
    fontSize: 24,
    color: '#46609e',
    fontWeight: 'bold',
    alignSelf: 'center'
  },
  homeButton: {
    top: 80,
    padding: 2,
    alignSelf: 'center'
  },
  button: {
    width: 192,
    backgroundColor: '#46609e',
    borderRadius: 192 / 2,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white'
  },
  cadastrarForm: {
    flex: 1
  },
  cadastrarButton: {
    alignSelf: 'center',
    marginBottom: 32
  },
  atualizarButton: {
    alignSelf: 'center',
    marginBottom: 32
  },
  inputView: {
    width: '100%',
    marginTop: 8
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  input: {
    fontSize: 14,
    backgroundColor: '#f4f0f0',
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginTop: 8
  },
  listarContainer: {
    flex: 1
  },
  cardAluno: {
    backgroundColor: '#f4f0f0',
    borderRadius: 4,
    paddingHorizontal: 12,
    marginTop: 8,
    paddingVertical: 12
  },
  tituloCardAluno: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#46609e',
    marginBottom: 8
  }
})