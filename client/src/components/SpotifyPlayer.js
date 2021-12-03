import React, { useState, useEffect, useContext, useRef } from "react"
import SpotifyPlayer from "react-spotify-web-playback"
import app from "../firebase";
import { getAuth } from "firebase/auth";
import { useAuth } from "../contexts/AuthContext";
import { getFirestore, collection, query, orderBy, limit, getDocs, where, onSnapshot} from "firebase/firestore";
import { TimeContext } from '../contexts/TimeContext';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import RefreshIcon from '@mui/icons-material/Refresh';
import "./Components.css"
import { stat } from "fs";

var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi({
  clientId : '0fbe30c6e814404e8324aa3838a7f322',
  clientSecret: 'e414b612d1ff45dd9ba6643e3161bdff',
  redirectUri: 'localhost:3000/Pineapple-Music'
});

const auth = getAuth(); // Authorization component
const db = getFirestore(app); // Firestore database
function GetQueue() {
  const [songQueue, setSongQueue] = useState();
  const currentUser = auth.currentUser;
  useEffect(() => {
    const queueRef = collection(db, 'userQueue', currentUser.uid, 'queue');
    const queueQuery = query(queueRef, orderBy('addedAt'), limit(25));
    const unsubscribe = onSnapshot(queueQuery, querySnapshot => {
        let queue = [];
        querySnapshot.forEach(doc => {
            var data = doc.data();
            queue.push(data.songUri);
        })
        setSongQueue(queue.reverse());
    })
    return () => unsubscribe;
  }, [])
  return songQueue;
}

async function getAccessToken() {
  const docSnap = await getDocs(collection(db, "users"));
  console.log(auth.currentUser.uid)
  let temp = null;
  docSnap.forEach((thing) => {
    console.log(thing.data().uid)
    if (thing.data().uid == auth.currentUser.uid) {
      temp = thing.data();
      
    }
  });
  console.log(temp)
  return temp;
}

function useForceUpdate(){
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
}

export default function Player(props) {
  const {setTime, updateTime, elapsed} = useContext(TimeContext);
  const [isLoaded, setIsLoaded] = useState(true);
  const [accessToken, setAccessToken] = useState("");
  const [update, setUpdate] = useState(true);
  const [shouldUpdate, setShouldUpdate] = useState(false)
  const [currentSongId, setCurrentSongId] = useState("");
  const [bookmarkTime, setBookmarkTime] = useState(-1);
  
  const { addBookmark } = useAuth();
  const dictRef = useRef();

  var bookmarkDict = {}

  spotifyApi.setAccessToken(props.accessToken);

  useEffect(() => {
    var promise = getAccessToken();
    promise.then((ret) => {
      setAccessToken(ret.SpotifyToken);
      console.log(ret.SpotifyToken)
      console.log(accessToken)
      spotifyApi.setAccessToken(ret.SpotifyToken);
    });
    console.log(accessToken);
  }, [isLoaded])

  //console.log("Token: " + accessToken)

  if (accessToken == undefined) {
    setIsLoaded(false)
  }


  var play2 = true;

  const auth = getAuth(); // Authorization component
  const db = getFirestore(app); // Firestore database

  useEffect(() => {
    console.log("update: " + update);
  }, [update]);

  function handleBookmark() {
    console.log("id: " + currentSongId);
    setUpdate(!update);
    setShouldUpdate(true);
    // forceUpdate;
  } 

  async function refreshBookmarks() {
    console.log("refreshing...")
    const q = query(collection(db, "users"), where("uid", "==", auth.currentUser.uid));
    const qSnap = await getDocs(q);
    qSnap.forEach((doc) => {
      // console.log("trackid: " + currentSongId + " " + "data: " + value)
      if (currentSongId) {
        // console.log(doc.data())
        for (const [key, value] of Object.entries(doc.data().bookmarks)) {
          bookmarkDict[key] = (value["time"]);
        }
        dictRef.current = bookmarkDict;
        for (const [key, value] of Object.entries(bookmarkDict)) {
          console.log("key/value: " + key + " " + value)
        }
        // console.log("trackid: " + currentSongId + " " + "data: " + value)
        // console.log("trackid: " + currentSongId + " " + "uid: " + doc.data().uid + " " + "data: " + key + "; " + value)
      }
    });
    console.log("current, bookmark: " + elapsed, bookmarkDict[currentSongId])
    console.log("refreshtest:", bookmarkDict[currentSongId])

    temp();
    // setBookmarkTime(thing.data.bookmarks[id])
  }

  // async function findBookmarkTime(id) {
  //   const q = query(collection(db, "users"), where("uid", "==", auth.currentUser.uid));
  //   const qSnap = await getDocs(q);
  //   qSnap.forEach((doc) => {
  //     if (id) {
  //       if (!doc.data().bookmarks[id]) {
  //         setBookmarkTime(-1);
  //       }
  //       const[key, value] = Object.entries(doc.data().bookmarks[id])
  //       console.log("trackid: " + currentSongId + " " + "data: " + value)
  //       // console.log("trackid: " + currentSongId + " " + "uid: " + doc.data().uid + " " + "data: " + key + "; " + value)
  //       setBookmarkTime(value)
  //     }
  //   });
  // }

  function temp() {
    console.log("temp:", currentSongId, bookmarkDict[currentSongId])
    for (const [key, value] of Object.entries(bookmarkDict)) {
      console.log("temploop: " + key + " " + value)
    }
    console.log("temp dict", JSON.stringify(dictRef.current))
  }

  useEffect(() => {
    // console.log("songid: " + currentSongId)
    if (dictRef.current) {
      if (dictRef.current.hasOwnProperty(currentSongId)) {
        console.log("skip?: " + elapsed, dictRef.current[currentSongId])
        if (elapsed > dictRef.current[currentSongId]) {
          console.log("SKIP")
        }
      }
    }
  }, [elapsed, bookmarkDict])
  

  useEffect(()=> {
    const interval = setInterval(async () => {
      updateTime();

      // if (currentSongId) {
      //   findBookmarkTime(currentSongId)
      // }
      
    }, 500);
    return () => clearInterval(interval);
  }, [isLoaded]);

  if (!props.accessToken) return null;
  return (
    <div style={{width: "100%", display: "flex"}}>
      <SpotifyPlayer
        token={props.accessToken}
        uris={props.songQueue}
        play={play2}
        autoPlay={true}
        callback={state => {
          if (state.isPlaying) {
            play2 = true;
          }
          else {
            play2 = false;
          }
          console.log("Track id: " + state.track.id);
          setCurrentSongId(state.track.id);

          refreshBookmarks();

          if (state.track.id != undefined && state.track.id != null &&
            state.track.id != "") {
          //console.log("Track id: " + state.track.id);
            spotifyApi.getAudioAnalysisForTrack(state.track.id)
            .then(function(data) {
              setTime({timeStamp: new Date(), elapsed: state.progressMs,
              isPlaying: state.isPlaying, beats: data.body.beats, segments: data.body.segments,
              song: state.track.id});
            }, 
            function(err) {
              console.log(err);
            });
          }
          if (shouldUpdate) {
            console.log("reachedupdate")
            addBookmark(state.track.id, state.progressMs)
            setUpdate(!update);
            setShouldUpdate(false);
            state.isPlaying = !update;
          }
        }}
        play = {update}
      />

      <button button className="bookmark-button" onClick = {() => handleBookmark()}>
          <BookmarkBorderIcon style={{ fontSize: 50 }} />
      </button>
      <button button className="bookmark-button" onClick = {() => refreshBookmarks()}>
          <RefreshIcon style={{ fontSize: 50 }} />
      </button>
    </div>
    
      
        

  )
}