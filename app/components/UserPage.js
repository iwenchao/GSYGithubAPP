/**
 * Created by guoshuyu on 2017/11/10.
 */

import React, {Component} from 'react';
import {
    View, Text, StatusBar, Image, InteractionManager
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import styles from "../style"
import PropTypes from 'prop-types';
import * as Constant from '../style/constant'
import loginActions from '../store/actions/login'
import userActions from '../store/actions/user'
import eventActions from '../store/actions/event'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import Icon from 'react-native-vector-icons/FontAwesome'
import UserHeadItem from './widget/UserHeadItem'
import PullListView from './widget/PullLoadMoreListView'
import EventItem from './widget/EventItem'
import {getActionAndDes} from '../utils/eventUtils'
import * as Config from '../config/'
import I18n from '../style/i18n'

class UserPage extends Component {

    constructor(props) {
        super(props);
        this._refresh = this._refresh.bind(this);
        this._loadMore = this._loadMore.bind(this);
        this.state = {
            dataSource: []
        };
        this.page = 2;
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.refs.pullList.showRefreshState();
            this._refresh();
        })
    }

    componentWillUnmount() {

    }

    _renderRow(rowData, sectionID, rowID, highlightRow) {
        let res = getActionAndDes(rowData);
        return (
            <EventItem
                actionTime={rowData.created_at}
                actionUser={rowData.actor.display_login}
                actionUserPic={rowData.actor.avatar_url}
                des={res.des}
                actionTarget={res.actionStr}/>
        )
    }

    /**
     * 刷新
     * */
    _refresh() {
        let {userState} = this.props;
        let userInfo = (this.props.ownUser && userState.userInfo) ? userState.userInfo : {};
        eventActions.getEvent(1, userInfo.login).then((res) => {
            let size = 0;
            if (res && res.result) {
                this.page = 2;
                this.setState({
                    dataSource: res.data
                });
                size = res.data.length;
            }
            setTimeout(() => {
                if (this.refs.pullList) {
                    this.refs.pullList.refreshComplete((size >= Config.PAGE_SIZE));
                }
            }, 500);
        })
    }

    /**
     * 加载更多
     * */
    _loadMore() {
        let {userState} = this.props;
        let userInfo = (this.props.ownUser && userState.userInfo) ? userState.userInfo : {};
        eventActions.getEvent(this.page, userInfo.login).then((res) => {
            this.page++;
            let size = 0;
            if (res && res.result) {
                let localData = this.state.dataSource.concat(res.data);
                this.setState({
                    dataSource: localData
                });
                size = res.data.length;
            }
            setTimeout(() => {
                if (this.refs.pullList) {
                    this.refs.pullList.loadMoreComplete((size >= Config.PAGE_SIZE));
                }
            }, 500);
        });
    }

    render() {
        let {userState} = this.props;
        let userInfo = (this.props.ownUser && userState.userInfo) ? userState.userInfo : {};
        return (
            <View style={styles.mainBox}>
                <StatusBar hidden={false} backgroundColor={'transparent'} translucent barStyle={'light-content'}/>
                <PullListView
                    style={{flex: 1}}
                    ref="pullList"
                    renderHeader={() => {
                        return (
                            <View>
                                <UserHeadItem
                                    userDisPlayName={userInfo.login}
                                    userName={userInfo.name}
                                    userPic={userInfo.avatar_url}
                                    groupName={userInfo.company}
                                    location={userInfo.location}
                                    link={userInfo.blog}
                                    des={userInfo.bio}
                                    star={(userInfo.starred) ? userInfo.starred : "---"}
                                    repos={userInfo.public_repos + ""}
                                    follower={userInfo.followers + ""}
                                    followed={userInfo.following + ""}
                                />
                                <View style={styles.flex}>
                                    <Text style={[styles.normalText, {
                                        fontWeight: "bold", marginTop: Constant.normalMarginEdge,
                                        marginLeft: Constant.normalMarginEdge,
                                    }]}>
                                        {I18n('personDynamic')}
                                    </Text>
                                </View>
                            </View>
                        );
                    }}
                    render
                    renderRow={(rowData, sectionID, rowID, highlightRow) =>
                        this._renderRow(rowData, sectionID, rowID, highlightRow)
                    }
                    refresh={this._refresh}
                    loadMore={this._loadMore}
                    dataSource={this.state.dataSource}
                />
            </View>
        )
    }
}

UserPage.propTypes = {
    ownUser: PropTypes.bool,
};


UserPage.defaultProps = {
    ownUser: true,
};


export default connect(state => ({
    userState: state.user,
}), dispatch => ({
    loginAction: bindActionCreators(loginActions, dispatch),
    userAction: bindActionCreators(userActions, dispatch)
}))(UserPage)