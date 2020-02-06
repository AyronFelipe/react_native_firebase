import React, { Component } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import api from '../services/api';


export default class Prevendas extends Component {

    static navigationOptions = {
        title: 'Pré-vendas',
        headerStyle: {
            backgroundColor: '#153e4d'
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
        },
    };

    state = {
        prevendas: [],
    }

    getPrevendas = async () => {
        try {
            const response = await api.get(`/prevendas/`, {
                params: {
                    page: 1,
                    data_ini: new Date('01/01/2019'),
                    data_fim: new Date(),
                }
            });
            this.setState({ prevendas: response.data });
        } catch (error) {
            console.log(error.response);
        }
    }

    componentDidMount(){
        this.getPrevendas();
    }

    renderItem = ({ item }) => (
        <View style={ styles.prevendaContainer }>
            <Text style={ styles.prevendaTitle }># { item.id_prevenda }</Text>
            <Text style={ styles.prevendaCliente }>Cliente: { item.nome_cliente }</Text>
            <Text style={ styles.prevendaPlanoPag }>Plano de Pagamento: { item.nome_plano_pag }</Text>
            <Text style={ styles.prevendaValor }>R$ { item.vl_total }</Text>
        </View>
    )

    render(){
        return(
            <View style={{ flex: 1, backgroundColor: '#153e4d' }}>
                <FlatList
                    contentContainerStyle={styles.list}
                    data={this.state.prevendas}
                    keyExtractor={ item => `${item.id_prevenda}` }
                    renderItem={this.renderItem}
                />
            </View>
        );
    }
}

styles = StyleSheet.create({
    list: {
        padding: 20,
    },
    prevendaContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 20,
        marginBottom: 20,
    },
    prevendaTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    prevendaValor: {
        fontSize: 17,
        color: '#1572e8',
        padding: 7,
        textAlign: 'right'
    }
})