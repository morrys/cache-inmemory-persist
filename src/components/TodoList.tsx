import * as React from 'react';
import styled from 'styled-components';
import TodoTextInput from './TodoTextInput';
import Todo from './Todo';
import { useEffect } from 'react';
import { useState } from 'react';
import Cache, { DataCache } from '@wora/cache-persist';

const StyledHeader = styled.div`
    padding: 10px;
    font-size: 16px;
    margin: 10px;
    margin-right: 0px;
    background-color: #0066ff;
    color: #fff;
    border: 2px solid #0066ff;
`;

const StyledList = styled.ul`
    list-style: none;
    color: red;
    padding-left: 0;
    width: 250px;
`;

const StyledButton = styled.button`
    margin: auto;
    padding: 10px;
    cursor: pointer;
    display: -webkit-box;
`;

interface Props {
    cache: Cache;
    name: string;
}

const TodoList = (props: Props) => {
    const [cache] = useState(props.cache);

    const [result, setResult] = useState<{ loading: boolean; data: DataCache }>({ loading: true, data: new Map() });

    useEffect(() => {
        const dispose = cache.subscribe((state, message) => {
            console.log('subscription', message);
            setResult({ loading: false, data: state });
        });
        cache.restore().then(() => {
            if (props.name === 'CacheLocalIDB') {
                console.log('inizio multi', Date.now());
                Array.from({ length: 1000 }, (_, x) => cache.set('' + x, 'x+1'));
            }
            cache.notify({ action: 'restored' });
        });
        return () => {
            dispose();
        };
    }, []);

    const handleTextInputSave = (text: string) => {
        const key =
            Math.random()
                .toString(36)
                .substring(2, 15) +
            Math.random()
                .toString(36)
                .substring(2, 15);
        cache.set(key, text);
        cache.remove(key);
        cache.set(key, text);
        cache.notify({ action: 'set' });
        return;
    };

    const deleteItem = (key: string) => {
        cache.remove(key);
        cache.notify({ action: 'delete' });
        return;
    };

    const replaceItem = () => {
        cache.replace({
            replace1: 'replace1',
            replace2: 'replace2',
        });
        cache.notify({ action: 'replace' });
        return;
    };

    const purge = () => {
        cache.purge();
        cache.flush().then(() => cache.notify({ action: 'purge' }));
    };

    const { loading, data } = result;

    console.log(data);
    const listItems = cache.getAllKeys().map((key) => <Todo key={key} item={{ key, value: data[key] }} deleteItem={deleteItem} />);

    if (loading) {
        return <div>loading...</div>;
    }

    return (
        <div>
            <StyledHeader>
                <StyledButton onClick={purge} className="refetch">
                    {' '}
                    Purge{' '}
                </StyledButton>
                <StyledButton onClick={replaceItem} className="refetch">
                    {' '}
                    Replace{' '}
                </StyledButton>
                <TodoTextInput placeholder={'Add Todo to ' + props.name} onSave={handleTextInputSave} />
                <StyledList>{listItems}</StyledList>
            </StyledHeader>
        </div>
    );
};

export default TodoList;
