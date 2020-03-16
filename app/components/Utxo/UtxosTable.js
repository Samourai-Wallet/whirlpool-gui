/**
 *
 * Status
 *
 */

import React, { useCallback, useMemo, useState } from 'react';
import _ from 'lodash';
import mixService from '../../services/mixService';
import * as Icon from 'react-feather';
import utils, { MIXABLE_STATUS, UTXO_STATUS, WHIRLPOOL_ACCOUNTS } from '../../services/utils';
import LinkExternal from '../Utils/LinkExternal';
import UtxoMixsTargetSelector from './UtxoMixsTargetSelector';
import UtxoPoolSelector from './UtxoPoolSelector';
import modalService from '../../services/modalService';

const UtxoControls = React.memo(({ utxo }) => {
  return (
    <div>
      {utxo.account === WHIRLPOOL_ACCOUNTS.DEPOSIT && mixService.isTx0Possible(utxo) && <button className='btn btn-sm btn-primary' title='Send to Premix' onClick={() => modalService.openTx0(utxo)}>Premix <Icon.ArrowRight size={12}/></button>}
      {mixService.isStartMixPossible(utxo) && utxo.mixableStatus === MIXABLE_STATUS.MIXABLE && <button className='btn btn-sm btn-primary' title='Start mixing' onClick={() => mixService.startMixUtxo(utxo)}>Mix <Icon.Play size={12} /></button>}
      {mixService.isStartMixPossible(utxo) && utxo.mixableStatus !== MIXABLE_STATUS.MIXABLE && <button className='btn btn-sm btn-border' title='Add to queue' onClick={() => mixService.startMixUtxo(utxo)}><Icon.Plus size={12} />queue</button>}
      {mixService.isStopMixPossible(utxo) && utxo.status === UTXO_STATUS.MIX_QUEUE && <button className='btn btn-sm btn-border' title='Remove from queue' onClick={() => mixService.stopMixUtxo(utxo)}><Icon.Minus size={12} />queue</button>}
      {mixService.isStopMixPossible(utxo) && utxo.status !== UTXO_STATUS.MIX_QUEUE && <button className='btn btn-sm btn-primary' title='Stop mixing' onClick={() => mixService.stopMixUtxo(utxo)}>Stop <Icon.Square size={12} /></button>}
    </div>
  )
});

/* eslint-disable react/prefer-stateless-function */
const UtxosTable = ({ controls, account, utxos }) => {
  const copyToClipboard = useCallback((text) => {
    const el = document.createElement('textarea');

    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';

    document.body.appendChild(el);

    el.select();
    document.execCommand('copy');

    document.body.removeChild(el);
  }, []);

  const [sortBy, setSortBy] = useState('lastActivityElapsed');
  const [ascending, setAscending] = useState(true);

  const handleSetSort = useCallback((key) => {
    if (sortBy === key) {
      setAscending(!ascending);
    } else {
      setAscending(true);
    }

    setSortBy(key);
  }, [sortBy, ascending]);

  const sortedUtxos = useMemo(() => {
    const sortedUtxos = _.sortBy(utxos, sortBy);

    if (!ascending) {
      return _.reverse(sortedUtxos);
    }

    return sortedUtxos;
  }, [utxos, sortBy, ascending]);

  const renderSort = sort => sortBy === sort && (ascending ? "▲" : "▼")

  return (
    <div className='table-utxos'>
      <table className="table table-sm table-hover">
        <thead>
          <tr>
            <th scope="col" className='clipboard'/>
            {account && <th scope="col" className='account'>
              <a onClick={() => handleSetSort('account')}>
                Account {renderSort('account')}
              </a>
            </th>}
            <th scope="col" className='hash'>
              <a onClick={() => handleSetSort('hash')}>
                UTXO {renderSort('hash')}
              </a>
            </th>
            <th scope="col" className='path'>
              <a onClick={() => handleSetSort('path')}>
                Path {renderSort('path')}
              </a>
            </th>
            <th scope="col" className='confirmations'>
              <a onClick={() => handleSetSort('confirmations')}>
                Confirms {renderSort('confirmations')}
              </a>
            </th>
            <th scope="col" className='value'>
              <a onClick={() => handleSetSort('value')}>
                Amount {renderSort('value')}
              </a>
            </th>
            <th scope="col" className='poolId'>
              <a onClick={() => handleSetSort('poolId')}>
                Pool {renderSort('poolId')}
              </a>
            </th>
            <th scope="col" className='mixsDone'>
              <a onClick={() => handleSetSort('mixsDone')}>
                Mixs {renderSort('mixsDone')}
              </a>
            </th>
            <th scope="col" className='utxoStatus'>
              <a onClick={() => handleSetSort('status')}>
                Status {renderSort('status')}
              </a>
            </th>
            <th scope="col" colSpan={2}>
              <a onClick={() => handleSetSort('lastActivityElapsed')}>
                Last activity {renderSort('lastActivityElapsed')}
              </a>
            </th>
            {controls && <th scope="col" className='utxoControls' />}
          </tr>
        </thead>
        <tbody>
        {sortedUtxos.map((utxo, i) => {
          const lastActivity = mixService.computeLastActivity(utxo);
          const utxoReadOnly = utils.isUtxoReadOnly(utxo);
          const allowNoPool = utxo.account === WHIRLPOOL_ACCOUNTS.DEPOSIT;

          return (
            <tr key={i} className={utxoReadOnly ? 'utxo-disabled' : ''}>
              <td>
                <span title='Copy TX ID'>
                  <Icon.Clipboard
                    className='clipboard-icon'
                    tabIndex={0}
                    size={18}
                    onClick={() => copyToClipboard(utxo.hash)}
                  />
                </span>
              </td>
              {account && <td><small>{utxo.account}</small></td>}
              <td>
                <small>
                  <span title={utxo.hash + ':' + utxo.index}>
                    <LinkExternal href={utils.linkExplorer(utxo)}>
                      {utxo.hash.substring(0, 20)}...{utxo.hash.substring(utxo.hash.length - 5)}:{utxo.index}
                    </LinkExternal>
                  </span>
                </small>
              </td>
              <td>
                <small>{utxo.path}</small>
              </td>
              <td>
                <small>{utxo.confirmations > 0 ? (
                  <span title="confirmations">{utxo.confirmations}</span>
                ) : (
                  <strong>unconfirmed</strong>
                )}
                </small>
              </td>
              <td>{utils.toBtc(utxo.value)}</td>
              <td>
                {!utxoReadOnly && <UtxoPoolSelector utxo={utxo} noPool={allowNoPool}/>}
              </td>
              <td>
                {!utxoReadOnly && <UtxoMixsTargetSelector utxo={utxo}/>}
              </td>
              <td>
                {!utxoReadOnly && <span className='text-primary'>{utils.statusLabel(utxo)}</span>}
              </td>
              <td className='utxoMessage'>
                {!utxoReadOnly && <small>{utils.utxoMessage(utxo)}</small>}
              </td>
              <td>
                {!utxoReadOnly && <small>{lastActivity ? lastActivity : '-'}</small>}
              </td>
              <td>
                {!utxoReadOnly && controls && <UtxoControls utxo={utxo}/>}
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
};

export default UtxosTable
