// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import styles from './Home.css';
import Button from 'react-bootstrap/lib/Button';

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container} data-tid="container">
        Welcome to <b>whirlpool-gui</b>.
        <Button>test</Button>
      </div>
    );
  }
}
