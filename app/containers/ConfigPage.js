// @flow
import React, { Component } from 'react';
import * as Icon from 'react-feather';

type Props = {};

export default class ConfigPage extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        <h1>Configuration</h1>

        <form>
          <div className="form-group row">
            <label htmlFor="inputPassword3" className="col-sm-2 col-form-label">Network</label>
            <div className="col-sm-8">
              <select className="form-control" id="exampleFormControlSelect1" disabled>
                <option>Testnet</option>
              </select>
            </div>
          </div>
          <div className="form-group row">
            <label htmlFor="inputPassword3" className="col-sm-2 col-form-label">TOR</label>
            <div className="col-sm-8">
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1" disabled/>
                <label className="form-check-label" htmlFor="inlineCheckbox1">Enable TOR (coming soon)</label>
              </div>
            </div>
          </div>
          <div className="form-group row">
            <label htmlFor="inputPassword3" className="col-sm-2 col-form-label">Setup mode</label>
            <label htmlFor="inputPassword3" className="col-sm-8 col-form-label"><Icon.CheckSquare /> Run whirlpool locally</label>
          </div>
          <div className="form-group row">
            <div className="col-sm-5">
              <button type="submit" className="btn btn-danger btn-xs">Reset configuration</button>
            </div>
            <div className="col-sm-5">
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
