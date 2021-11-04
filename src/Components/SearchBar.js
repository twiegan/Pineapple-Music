import React, { useEffect, useState } from "react";
import { useHistory } from 'react-router';
import "./SearchBar.css";
import SearchIcon from "@material-ui/icons/Search";
import CloseIcon from "@material-ui/icons/Close";
import Track from './Track'
import queueConverter from './Queue';
import app from '../firebase';
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, where, doc, addDoc, query, orderBy, limit, getDocs, setDoc, onSnapshot, Timestamp } from "firebase/firestore";
var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi({
    clientId : '0fbe30c6e814404e8324aa3838a7f322',
    clientSecret: 'e414b612d1ff45dd9ba6643e3161bdff',
    redirectUri: 'localhost:3000/Pineapple-Music'
});

const auth = getAuth(); // Authorization component
const db = getFirestore(app); // Firestore database

function SearchBar({ placeholder, spotifyData, authorized }) {
  
  const currentUser = auth.currentUser;
  console.log(currentUser.uid);
  
  const history = useHistory();

  console.log(spotifyData);
  const [wordEntered, setWordEntered] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const access_token = spotifyData;
  useEffect(() => {
    if (!access_token) return
    spotifyApi.setAccessToken(access_token);
    console.log(access_token)
    handleSubmitToken();
  }, [access_token])

  useEffect(() => {
    if (!wordEntered) return setSearchResults([])
    spotifyApi.searchTracks(wordEntered).then(res => {
        console.log(res.body.tracks.items);
        setSearchResults(
            res.body.tracks.items.map(track => {
              return {
                artist: track.artists[0].name,
                title: track.name,
                uri: track.uri,
                albumUrl: track.album.images[0].url,
              }
            })
        )
    });
  }, [wordEntered, access_token])

  const handleFilter = (event) => {
    const searchWord = event.target.value;
    setWordEntered(searchWord);
  };

  async function handleSubmitTrack(track) {
    await addDoc(collection(db, 'userQueue', currentUser.uid, 'queue'), {
        songUri: track.uri,
        songName: track.title,
        addedAt: Timestamp.fromDate(new Date())
    });
  }

  async function handleSubmitToken() {
    const userRef = collection(db, 'users');
    await setDoc(doc(userRef, currentUser.uid), {
        SpotifyToken: access_token,
    });
  }

  function handleRedirect(track) {
      console.log(track);
      setPlayingTrack(track);
      handleSubmitTrack(track);
      history.push({
          pathname: '/song',
          state: {name: track.title, picture: track.albumUrl, trackUri: track.uri, access_token: access_token}
      });
      //setPlayingTrack(track);
  }
  const playSong = (id) => {
    spotifyApi
      .play({
        uris: [`spotify:track:${id}`],
      })
      /*.then((res) => {
        spotifyApi
        .getMyCurrentPlayingTrack().then((r) => {
          dispatch({
            type: "SET_ITEM",
            item: r.item,
          });
          dispatch({
            type: "SET_PLAYING",
            playing: true,
          });
        });
      });*/
  };

  return (
    <div className="search">
      <div className="searchInputs">
        <input
          type="text"
          placeholder={placeholder}
          value={wordEntered}
          onChange={handleFilter}
        />
        <div className="searchIcon">
          
        </div>
      </div>
      
      {searchResults.length != 0 && (
        <div className="dataResult">
          {searchResults.slice(0, 10).map((track) => {
            return (
                <Track
                    track={track}
                    key={track.uri}
                    chooseTrack={handleRedirect}
                />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SearchBar;