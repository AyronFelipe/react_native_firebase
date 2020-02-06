import { createStackNavigator, createAppContainer } from "react-navigation";
import Login from './pages/login';
import Prevendas from './pages/prevendas';

const AppNavigator = createStackNavigator({
    Login: {
        screen: Login
    },
    Prevendas: {
        screen: Prevendas
    }
});

export default createAppContainer(AppNavigator)