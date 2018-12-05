import React from 'react';
import { FlatList, TouchableOpacity, Image, StyleSheet, Text, View } from 'react-native';
import { SearchBar } from "react-native-elements";
import AppStyles from '../AppStyles';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import TextButton from 'react-native-button';
import firebase from 'react-native-firebase';

class SearchScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            headerLeft:
                <TouchableOpacity style={AppStyles.styleSet.menuBtn.container} onPress={() => { navigation.openDrawer() }} >
                    <Image style={AppStyles.styleSet.menuBtn.icon} source={AppStyles.iconSet.menu} />
                </TouchableOpacity>,
            headerTitle:
                <SearchBar
                    containerStyle={AppStyles.styleSet.searchBar.container}
                    inputStyle={AppStyles.styleSet.searchBar.input}
                    showLoading
                    clearIcon={true}
                    searchIcon={true}
                    onChangeText={(text) => params.handleSearch(text)}
                    // onClear={alert('onClear')}
                    placeholder='Search' />,
        }
    };

    constructor(props) {
        super(props);

        this.ref = firebase.firestore().collection('users');
        this.unsubscribe = null;

        this.state = {
            keyword: null,
            users: [],
            filteredUsers: []
        };
    }


    componentDidMount() {
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate)
        this.props.navigation.setParams({
            handleSearch: this.onSearch
        });
    }

    onCollectionUpdate = (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
            const user = doc.data();
            data.push({ ...user, id: doc.id });
        });

        this.setState({ 
            users: data,
            filteredUsers: data 
        });
    }

    filteredUsers = (keyword) => {
        if (keyword) {
            return this.state.users.filter(user => {
                return user.firstName.indexOf(keyword) >= 0;
            });
        } else {
            return this.state.users;
        }
    }

    onSearch = (text) => {
        this.setState({keyword: text});
        const filteredUsers = this.filteredUsers(text);
        this.setState({filteredUsers: filteredUsers});
    }

    onPress = (item) => {
        this.props.navigation.navigate('Detail', { item: item });
    }

    renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => this.onPressUser(item)}>
            <View style={styles.container}>
                <FastImage style={styles.photo} source={{ uri: item.profilePictureURL }} />
                <Text style={styles.name}>{item.firstName}</Text>
                <TextButton style={styles.add} onPress={() => this.onAdd(item)} >Add</TextButton>
                <TextButton style={styles.accept} onPress={() => this.onAccept(item)} >Accept</TextButton>
            </View>
        </TouchableOpacity>
    );


    render() {
        return (
            <FlatList
                data={this.state.filteredUsers}
                renderItem={this.renderItem}
                keyExtractor={item => `${item.id}`}
                initialNumToRender={5}
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: AppStyles.colorSet.mainSubtextColor,
    },
    photo: {
        height: 40,
        borderRadius: 20,
        width: 40,
    },
    name: {
        marginLeft: 20,
        alignSelf: 'center',
        flex: 1,
        color: AppStyles.colorSet.mainTextColor,
    },
    add: {
        alignSelf: 'center',
        borderWidth: 0.5,
        borderColor: AppStyles.colorSet.hairlineColor,
        color: AppStyles.colorSet.mainThemeForegroundColor,
        padding: 5,
        paddingLeft: 20,
        paddingRight: 20,
        borderRadius: 5,
        fontWeight: 'normal',
    },
    accept: {
        marginLeft: 10,
        alignSelf: 'center',
        borderWidth: 0.5,
        fontWeight: 'normal',
        color: AppStyles.colorSet.mainThemeForegroundColor,
        borderColor: AppStyles.colorSet.hairlineColor,
        padding: 5,
        paddingLeft: 20,
        paddingRight: 20,
        borderRadius: 5,
    },
    rightBtncontainer: {
        backgroundColor: AppStyles.colorSet.hairlineColor,
        justifyContent: 'center',
        paddingLeft: 20,
        paddingRight: 20,
    },
    rightBtnIcon: {
        alignSelf: 'center',
        tintColor: AppStyles.colorSet.mainThemeForegroundColor,
        width: 15,
        height: 15,
    },
});

const mapStateToProps = state => ({
    user: state.auth.user,
});

export default connect(mapStateToProps)(SearchScreen);
