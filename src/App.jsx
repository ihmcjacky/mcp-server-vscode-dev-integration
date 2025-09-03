import React, { useEffect } from 'react';
import OrderSummaryCard from "components/OrderSummaryCard"; // Problematic path declaration
import { io } from 'socket.io-client'
import AdminPageContainer from "containers/AdminPageContainer"; // Problematic path declaration
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ThemeProvider } from '@material-ui/styles';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createTheme } from '@material-ui/core/styles';
import { envConst } from "misc/lng"; // Problematic path declaration
import { saveWsObj, saveWsCloudObj } from "actions";
import SalesReportPerMonth from './pages/SalesReportPerMonth';
import 'typeface-roboto';
import './App.css';

// define global site main and secondary color
const themeStyle = {
    palette: {
        primary: {
            main: 'rgb(131, 151, 136)',
            custlight: '#ffb74d',
            light: 'rgb(242, 153, 74, 0.8)',
            lightBlack: '#4F4F4F',
            takeAway: 'rgb(79, 79, 79)',
            splitTbl: 'rgb(111, 207, 150)',
            white: '#ffffff'
        },
        secondary: {
            main: '#000000',
            main2: '#212121',
            light: '#484848'
        },
        disabled: '#978989',
        disabledLight: '#E0E0E0',
        error: {
            main: '#eb5757',
            whiteTxt: '#ffffff'
        }
    },
    fonts: {
        commonFontSize: {
            fontSize: '2.2rem'
        },
        systemTitle: {
            fontSize: '2rem',
            fontWeight: 'bold',
            display: 'flex',
        },
        adminPageTitle: {
            fontSize: '1.8rem',
            fontWeight: '700',
        }
    },
    numPad: {
        header: {
            primaryColor: 'rgb(131, 151, 136)',
            secondaryColor: '#ffffff',
            highlightColor: '#FFC107',
            backgroundColor: 'rgb(131, 151, 136)',
        },
        body: {
            primaryColor: 'rgb(131, 151, 136)',
            secondaryColor: '#32a5f2',
            highlightColor: '#FFC107',
            backgroundColor: '#f9f9f9',
        },
        panel: {
            backgroundColor: '#FFFFFF',
        },
        global: {}
    }
};
const theme = createTheme(themeStyle);
const { FEAT: { CLNT_ORDERING } } = envConst;

// main entrance
const App = (props) => {
    useEffect(() => {
        // connect and assign ws obj to store (frontend <> loopback)
        console.log(envConst.WS_URL);
        const wso = io(envConst.WS_URL, {
            transports: ['websocket'],
            withCredentials: process.env.NODE_ENV === 'production' ? true : false
        });
        props.saveWsObj(wso);
        console.warn(process.env);

        var ws_reconnect;

        if (!CLNT_ORDERING || CLNT_ORDERING !== 'disabled') {
            // connect and assign ws obj to store (frontend <> cloud), controlled by env variable
            let wso_cloud = null;

            if (process.env.NODE_ENV === 'production') {
                wso_cloud = io(envConst.WS_CLOUD_URL, { withCredentials: true });
            } else {
                console.warn(envConst)
                wso_cloud = io(envConst.WS_CLOUD_URL);
            }

            props.saveWsCloudObj(wso_cloud);

            ws_reconnect = setInterval(() => {
                // console.warn(wso_cloud.connected);
                if (!wso_cloud.connected) {
                    wso_cloud.connect();
                }
            }, 2000);
        }

        // clean up and close socket
        return () => {
            // close and remove socket
            props.ws && props.ws.close();
            props.ws_cloud && props.ws_cloud.close();
            clearInterval(ws_reconnect);
        }
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <Router>
                    {/* <Route exact path="/" 
                        render={(props)=> <ConfirmOrderCard {...props} changeView={()=> (<div></div>)} orderData={{some: 'data'}} confirmOrderStatus={()=>{console.log('tmp')}} render={(stateObj) => (<div>yes</div>)} setTotalPay={()=>{}}/>} /> */}
                    <Route exact path="/" component={AdminPageContainer} />
                    <Route path="/orders/:oid" component={OrderSummaryCard} />
                    <Route path="/admin" component={AdminPageContainer} />
                    <Route path="/salesReport" component={SalesReportPerMonth} />
                </Router>
            </div>
        </ThemeProvider>
    );
}

const mapStateToProps = (state) => {
    return {
        view: state.commonReducer.view,
        ws: state.commonReducer.ws,
        ws_cloud: state.commonReducer.ws_cloud
    }
}

export default compose(
    connect(mapStateToProps, {
        saveWsObj,
        saveWsCloudObj
    }),
)(App);
