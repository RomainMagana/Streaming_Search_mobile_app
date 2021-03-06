import './Search.css';
import {
    IonCard, IonCardContent,
    IonContent,
    IonHeader, IonIcon, IonImg,
    IonInfiniteScroll,
    IonInfiniteScrollContent, IonItem, IonLabel, IonList,
    IonPage, IonRow, IonSearchbar, IonText,
    IonTitle,
    IonToolbar, useIonViewWillEnter, withIonLifeCycle,
} from '@ionic/react';
import './Home.css';
import React, {useState} from "react";
import {EpisodeDate} from "../api/results/EpisodeDate";
import {heart, home} from "ionicons/icons";
import getSeries from "../StorageServices/getSeries";
import {Series} from "../api/response/Series";
import {setOrRemoveFavorite} from "../StorageServices/favoriteServices";
import HeartComponents from "../components/HeartComponents";

const Search: React.FC = () => {
    const [series, setSeries] = useState<EpisodeDate>({
        page: 0,
        pages: 0,
        total: 0,
        tv_shows: [],
    });

    const [loadData, setLoadData] = useState(false);
    const [searchText, setSearchText] = useState('');

    async function getAllSeries(url: string) {
        try {
            setLoadData(true);
            const newSeries = await getSeries(url, series);
            setSeries(newSeries);
            setLoadData(false);
        } catch (e) {
            console.log(e);
        }
    }

    async function searchSeries(search: string) {
        setSearchText(search);
        try {
            setLoadData(true);
            const response = await fetch(`https://www.episodate.com/api/search?q=${search}`);
            const data = await response.json();
            if (data.pages != 0) {
                setSeries(data);
            }
            setLoadData(false);
        } catch (e) {
            console.log(e);
        }
    }

    useIonViewWillEnter(async () => {
        await getAllSeries('https://www.episodate.com/api/search?q=&&page=1');
    });

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonSearchbar value={searchText} onIonChange={e => searchSeries(e.detail.value!)}
                                  placeholder="Search episode"/>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonList>
                    {series?.tv_shows.map((value) => {
                            return (
                                <IonItem routerLink={'details/' + value.id} key={value.id} >
                                    <IonCard className={'ion-margin-bottom series__card'}>
                                        <IonCardContent className={'ion-no-padding'}>
                                            <IonImg src={value.image_thumbnail_path} className={'series__image'}/>
                                            <IonItem>
                                                <IonLabel className={'series__title'} slot="start">{value.name}</IonLabel>
                                                <HeartComponents value={value}/>
                                            </IonItem>
                                        </IonCardContent>
                                    </IonCard>
                                </IonItem>
                            )
                        }
                    )}
                </IonList>

                <IonInfiniteScroll
                    onIonInfinite={async () =>
                        series.page < series.pages ? await getAllSeries(`https://www.episodate.com/api/search?q=${searchText}&page=${series.page + 1}`) : setLoadData(false)}
                    threshold="100px"
                    disabled={loadData}>
                    <IonInfiniteScrollContent loadingSpinner="bubbles" loadingText="Loading more data..."/>
                </IonInfiniteScroll>

            </IonContent>
        </IonPage>
    );
};


export default Search;
