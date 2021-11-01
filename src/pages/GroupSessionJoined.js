import React, { useState, createRef } from "react";

import Overlay from 'react-bootstrap/Overlay';
import Button from 'react-bootstrap/Button';
import SearchIcon from '@mui/icons-material/Search';

import {
  Box,
  Grid,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import ChatRoom from "../components/Chat/ChatRoom";
import SearchBar from '../components/SearchBar';

import app from "../firebase";
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import FastRewindRoundedIcon from '@mui/icons-material/FastRewindRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';

const pgStyle = {
    "display": "flex",
    "position": "fixed"
}

const infoStyle = {

}

const chatStyle = {

}

export default class GroupSessionJoined extends React.Component{
    constructor (props) {
        super(props);
        this.inputRef = createRef();
        this.state = {
            title: props.location.props.title,
            sessionId: props.location.props.sessionId,
            imageUrl: props.location.props.imageUrl, 
            username: props.location.props.username, 
            createdAt: props.location.props.createdAt,
            show :false,
            opacity:1,
            color : "rgba(" +40 + "," + 40 + "," + 40 + "," + 0.2 + ")",
            buttonMessage :"Open Song Queue",
            isPlaying: false,
        }
    }
    handleShow (event) {
        this.setState({
            show :!this.state.show,
        });
        if (this.state.opacity == 1) {
            this.setState({
                opacity :0.5,
                color : "rgba(" +40 + "," + 40 + "," + 40 + "," + 1 + ")",
                buttonMessage:"Close Song Queue",
            })
        }
        else {
            this.setState({
                opacity :1,
                color : "rgba(" +40 + "," + 40 + "," + 40 + "," + 0.2 + ")",
                buttonMessage: "Open Song Queue",
            })
        }
    };

    render () {
        // const groupSession = useLocation();
        const token = "";
        return (
            <div style={{backgroundColor: this.state.color, opacity: this.state.opacity}}>
                <div className="info-section" style={infoStyle}>
                    <Typography gutterBottom variant="h5" component="div">
                        {this.state.title}
                    </Typography>
                    <text>Session ID: </text>
                    <Typography gutterBottom variant="h5" component="div">
                        {this.state.sessionId}
                    </Typography>

                    <Button variant="danger" ref={this.inputRef} onClick={this.handleShow.bind(this)}>
                        {this.state.buttonMessage}
                    </Button>
                    <Overlay target={this.inputRef.current} show={this.state.show} placement="right">
                        {({ placement, arrowProps, show: _show, popper, ...props }) => (
                        <div
                            {...props}
                            style={{
                                flex:1,
                                flexDirection:"column",
                                margin:"50px",
                                backgroundColor: "#202020",
                                padding: '2px 10px',
                                color: 'white',
                                width:"600px",
                                height:"500px",
                                borderRadius: 50,
                                textAlign:"center",
                                ...props.style,
                            }}
                        >
                            <text>Group Session Song Queue</text>
                            <SearchIcon></SearchIcon>
                            <div>
                                <SearchBar placeholder="Enter a song name..." spotifyData={token} authorized={true} />
                                <br />
                            <br />
                            <Button
                                variant="outlined"
                                color="primary"
                            >
                                Login to Spotify
                            </Button>
                            <br />
                            <br />
                            </div>
                        </div>
                        )}
                    </Overlay>
                    <div className="Player-Div">
                        <button className="forward-rewind"><FastRewindRoundedIcon style={{ fontSize: 50 }}/></button>
                        <button className="playPauseButton"><PlayArrowRoundedIcon style={{ fontSize: 50 }}/></button>
                        <button className="forward-rewind"><FastForwardRoundedIcon style={{ fontSize: 50 }}/></button>
                    </div>
                </div>
                <div className="chat-section" style={chatStyle}>
                    <ChatRoom groupSessionID={this.state.sessionId} groupSessionTitle={this.state.title}/>
                </div>
            </div>
      );
    }
}