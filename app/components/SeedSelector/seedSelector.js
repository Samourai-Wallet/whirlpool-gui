/**
 *
 * Status
 *
 */

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';

const NB_WORDS = 12

/* eslint-disable react/prefer-stateless-function */
class SeedSelector extends React.PureComponent {

  constructor(props) {
    super(props)

    this.state = {
      selectedWords: new Array(NB_WORDS),
      nbWords: 0
    }

    this.words = new Array(NB_WORDS)

    this.onChangeWord = this.onChangeWord.bind(this)
    this.onClearWord = this.onClearWord.bind(this)
  }

  onChangeWord(word, i) {
    this.words[i] = word
    this.state.selectedWords[i] = true

    const nbWords = this.setWords()

    if (nbWords === NB_WORDS) {
      const encryptedSeedWords = this.props.encrypt(this.words.join(' '))
      this.props.onSubmit(encryptedSeedWords)
    }
  }

  onClearWord(i) {
    this.words[i] = undefined
    this.state.selectedWords[i] = false
    this.setWords()
  }

  setWords() {
    const nbWords = this.state.selectedWords.filter(word => word ? true : false).length
    this.setState({
      selectedWords: this.state.selectedWords,
      nbWords: nbWords
    })
    return nbWords
  }

  render () {
    return (
      <div>
        <div className='row'>
          {Array.from(Array(NB_WORDS).keys()).map(i => {
            return <div className='col-sm-2' key={i}>
              {this.state.selectedWords[i] &&
                <span className='clearWord' onClick={() => this.onClearWord(i)}><FontAwesomeIcon icon={Icons.faCheck} color='green' /> word #{(i+1)} selected</span>
              }
              {!this.state.selectedWords[i] &&
              <select className='form-control form-control-sm' onChange={(e) => this.onChangeWord(e.target.value, i)}>
                <option>Select word #{(i + 1)}</option>
                {this.props.words.map(word => <option value={word} key={word}>{word}</option>)}
              </select>
              }
              <br/>
            </div>
          })}
        </div>
        <div className='row'>
          <div className='col-sm-12 text-center'>
            <small>{this.state.nbWords}/{NB_WORDS} words</small>
          </div>
        </div>
      </div>
    )
  }
}

export default SeedSelector
