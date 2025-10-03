import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconSearch,
  IconFolders,
  IconArrowsSort,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
  IconX,
  IconTarget
} from '@tabler/icons';
import Collection from './Collection';
import CreateCollection from '../CreateCollection';
import StyledWrapper from './StyledWrapper';
import CreateOrOpenCollection from './CreateOrOpenCollection';
import { sortCollections } from 'providers/ReduxStore/slices/collections/actions';
import { expandItemAndScrollToIt, clearItemHighlight } from 'providers/ReduxStore/slices/collections';

// todo: move this to a separate folder
// the coding convention is to keep all the components in a folder named after the component
const CollectionsBadge = () => {
  const dispatch = useDispatch();
  const { collections } = useSelector((state) => state.collections);
  const { collectionSortOrder } = useSelector((state) => state.collections);
  const sortCollectionOrder = () => {
    let order;
    switch (collectionSortOrder) {
      case 'default':
        order = 'alphabetical';
        break;
      case 'alphabetical':
        order = 'reverseAlphabetical';
        break;
      case 'reverseAlphabetical':
        order = 'default';
        break;
    }
    dispatch(sortCollections({ order }));
  };
  return (
    <div className="items-center mt-2 relative">
      <div className="collections-badge flex items-center justify-between px-2">
        <div className="flex items-center  py-1 select-none">
          <span className="mr-2">
            <IconFolders size={18} strokeWidth={1.5} />
          </span>
          <span>Collections</span>
        </div>
        {collections.length >= 1 && (
          <button onClick={() => sortCollectionOrder()}>
            {collectionSortOrder == 'default' ? (
              <IconArrowsSort size={18} strokeWidth={1.5} />
            ) : collectionSortOrder == 'alphabetical' ? (
              <IconSortAscendingLetters size={18} strokeWidth={1.5} />
            ) : (
              <IconSortDescendingLetters size={18} strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const Collections = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const { collections } = useSelector((state) => state.collections);
  const [createCollectionModalOpen, setCreateCollectionModalOpen] = useState(false);
  const activeTabUid = useSelector((state) => state.tabs.activeTabUid);
  const tabs = useSelector((state) => state.tabs.tabs);
  const activeTab = tabs.find((t) => t.uid === activeTabUid);

  // Find the active item and collection
  const activeItem = activeTab && activeTab.collectionUid ? (() => {
    const collection = collections.find((c) => c.uid === activeTab.collectionUid);
    if (!collection) return null;

    // Helper to find item recursively
    const findItem = (items) => {
      for (const item of items || []) {
        if (item.uid === activeTab.uid) return { item, collection };
        if (item.items) {
          const found = findItem(item.items);
          if (found) return found;
        }
      }
      return null;
    };

    return findItem(collection.items);
  })() : null;

  const handleScrollToActiveItem = () => {
    if (!activeItem) return;

    dispatch(expandItemAndScrollToIt({
      itemUid: activeItem.item.uid,
      collectionUid: activeItem.collection.uid
    }));

    // Scroll to the item in the sidebar after a short delay to allow folders to expand
    setTimeout(() => {
      const itemElement = document.querySelector(`[data-item-uid="${activeItem.item.uid}"]`);
      if (itemElement) {
        itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    // Clear highlight after animation completes
    setTimeout(() => {
      dispatch(clearItemHighlight({
        itemUid: activeItem.item.uid,
        collectionUid: activeItem.collection.uid
      }));
    }, 2000);
  };

  if (!collections || !collections.length) {
    return (
      <StyledWrapper>
        <CollectionsBadge />
        <CreateOrOpenCollection />
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      {createCollectionModalOpen ? <CreateCollection onClose={() => setCreateCollectionModalOpen(false)} /> : null}

      <CollectionsBadge />

      <div className="mt-4 relative collection-filter px-2 flex items-center gap-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">
              <IconSearch size={16} strokeWidth={1.5} />
            </span>
          </div>
          <input
            type="text"
            name="search"
            placeholder="Search requests …"
            id="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            className="block w-full pl-7 py-1 sm:text-sm"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value.toLowerCase())}
          />
          {searchText !== '' && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <span
                className="close-icon"
                onClick={() => {
                  setSearchText('');
                }}
              >
                <IconX size={16} strokeWidth={1.5} className="cursor-pointer" />
              </span>
            </div>
          )}
        </div>
        {activeItem && (
          <button
            onClick={handleScrollToActiveItem}
            title="Show in Sidebar"
            className="flex items-center justify-center p-1 opacity-30 hover:opacity-100 transition-opacity"
          >
            <IconTarget size={18} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col overflow-hidden hover:overflow-y-auto absolute top-32 bottom-0 left-0 right-0">
        {collections && collections.length
          ? collections.map((c) => {
              return (
                <Collection searchText={searchText} collection={c} key={c.uid} />
              );
            })
          : null}
      </div>
    </StyledWrapper>
  );
};

export default Collections;
