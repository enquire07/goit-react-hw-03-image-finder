import React, { Component } from 'react';
import SearchBar from './Searchbar/Searchbar';
import ImageGallery from './ImageGallery/ImageGallery';
import Button from './Button/Button';
import Loader from './Loader/Loader';
import { getAPI } from 'pixabay-api';
import styles from './App.module.css';
import toast, { Toaster } from 'react-hot-toast';

class App extends Component {
  state = {
    images: [],
    currentPage: 1,
    searchQuery: '',
    isLoading: false,
    isError: false,
    isEnd: false,
  };

  async componentDidUpdate(_prevProps, prevState) {
    const { searchQuery, currentPage } = this.state;

    if (
      prevState.searchQuery !== searchQuery ||
      prevState.currentPage !== currentPage
    ) {
      await this.fetchImages();
    }
  }

  fetchImages = async () => {
    this.setState({ isLoading: true, isError: false });

    const { searchQuery, currentPage } = this.state;

    try {
      const response = await getAPI(searchQuery, currentPage);
      console.log(response);
      const { totalHits, hits } = response;

      this.setState(prevState => ({
        images: currentPage === 1 ? hits : [...prevState.images, ...hits],
        isLoading: false,
        isEnd: prevState.images.length + hits.length >= totalHits,
      }));

      if (hits.length === 0) {
        toast.error("This didn't work.");
        return;
      }
    } catch (error) {
      this.setState({ isLoading: false, isError: true });
      toast(`An error occurred while fetching data: ${error}`);
    }
  };

  handleSearchSubmit = query => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedCurrentQuery = this.state.searchQuery.toLowerCase();

    if (normalizedQuery === '') {
      toast('Hello Darkness!', {
        icon: '👏',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }

    if (normalizedQuery === normalizedCurrentQuery) {
      toast.success('Successfully toasted!');

      return;
    }

    if (normalizedQuery !== normalizedCurrentQuery) {
      this.setState({
        searchQuery: normalizedQuery,
        currentPage: 1,
        images: [],
        isEnd: false,
      });
    }
  };

  handleLoadMore = () => {
    if (!this.state.isEnd) {
      this.setState(prevState => ({ currentPage: prevState.currentPage + 1 }));
    } else {
    }
  };

  render() {
    const { images, isLoading, isError, isEnd } = this.state;
    return (
      <div className={styles.App}>
        <SearchBar onSubmit={this.handleSearchSubmit} />
        <ImageGallery images={images} />
        {isLoading && <Loader />}
        {!isLoading && !isError && images.length > 0 && !isEnd && (
          <Button onClick={this.handleLoadMore} />
        )}
        {isError && <p>Something went wrong. Please try again later.</p>}
        <Toaster position="top-center" reverseOrder={false} />
      </div>
    );
  }
}

export default App;
