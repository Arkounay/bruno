import React from 'react';
import Modal from 'components/Modal';
import { isItemAFolder } from 'utils/tabs';
import { useDispatch, useSelector } from 'react-redux';
import { closeTabs } from 'providers/ReduxStore/slices/tabs';
import { deleteMultipleItems } from 'providers/ReduxStore/slices/collections/actions';
import { recursivelyGetAllItemUids, findItemInCollection } from 'utils/collections';
import { findCollectionByUid } from 'utils/collections';
import StyledWrapper from './StyledWrapper';

const DeleteMultipleItems = ({ onClose, itemUids, collectionUid }) => {
  const dispatch = useDispatch();
  const collection = useSelector((state) =>
    state.collections.collections?.find((c) => c.uid === collectionUid));

  const items = itemUids
    .map((uid) => collection ? findItemInCollection(collection, uid) : null)
    .filter(Boolean);

  const onConfirm = () => {
    dispatch(deleteMultipleItems(itemUids, collectionUid)).then(() => {
      // Close all tabs for deleted items
      const tabUidsToClose = [];

      items.forEach((item) => {
        if (isItemAFolder(item)) {
          // For folders, close all child tabs as well
          tabUidsToClose.push(...recursivelyGetAllItemUids(item.items), item.uid);
        } else {
          tabUidsToClose.push(item.uid);
        }
      });

      if (tabUidsToClose.length > 0) {
        dispatch(closeTabs({ tabUids: tabUidsToClose }));
      }
    });
    onClose();
  };

  const itemCount = items.length;
  const folderCount = items.filter((item) => isItemAFolder(item)).length;
  const requestCount = items.filter((item) => !isItemAFolder(item)).length;

  let itemTypeText = '';
  if (folderCount > 0 && requestCount > 0) {
    itemTypeText = `${folderCount} folder${folderCount > 1 ? 's' : ''} and ${requestCount} request${requestCount > 1 ? 's' : ''}`;
  } else if (folderCount > 0) {
    itemTypeText = `${folderCount} folder${folderCount > 1 ? 's' : ''}`;
  } else {
    itemTypeText = `${requestCount} request${requestCount > 1 ? 's' : ''}`;
  }

  return (
    <StyledWrapper>
      <Modal
        size="md"
        title={`Delete ${itemCount} Item${itemCount > 1 ? 's' : ''}`}
        confirmText="Delete"
        handleConfirm={onConfirm}
        handleCancel={onClose}
      >
        <div>
          <p>Are you sure you want to delete {itemTypeText}?</p>
          <div className="mt-4 max-h-64 overflow-y-auto">
            <ul className="list-disc pl-5">
              {items.map((item) => (
                <li key={item.uid} className="mb-1">
                  <span className="font-semibold">{item.name}</span>
                  {isItemAFolder(item) && <span className="text-muted ml-1">(folder)</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>
    </StyledWrapper>
  );
};

export default DeleteMultipleItems;
