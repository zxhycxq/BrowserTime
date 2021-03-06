import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { FixedSizeList as List } from 'react-window';
import {
  Grid,
  Card,
  CardHeader,
  Divider,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Fade,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import HistoryListItem from '../HistoryListItem';
import { SettingsContext } from '../../context/SettingsContext';
import { getCustom } from '../../lib/helpers/millisecond-helpers';
import { deleteHistoryRange } from '../../lib/helpers/chrome-helpers';

const useStyles = makeStyles((theme) => ({
  historyListGrid: {
    marginTop: theme.spacing(3),
  },
  menuIcon: {
    marginRight: theme.spacing(1) * 1.5,
  },
}));

const HistoryList = ({
  data,
  getSelectedForDeleteIndex,
  handleSelectedForDelete,
  searchText,
  handleMoreFromThisSite,
  handleDeleteSingleItem,
  forceUpdate,
}) => {
  const classes = useStyles();
  const { settingsState } = useContext(SettingsContext);
  const { date, items } = data;

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const deleteEntireDay = () => {
    const dayRange = getCustom(date, date);
    deleteHistoryRange(dayRange)
      .then(() => forceUpdate())
      .catch((error) => console.error('deleteEntireDay error deleting history', error));
  };

  const isSelectedForDelete = (val) => getSelectedForDeleteIndex(val) > -1;

  const Row = ({ index, style }) => {
    const isSelected = isSelectedForDelete({ lastVisitTime: items[index].lastVisitTime });
    return (
      <div style={style}>
        <HistoryListItem
          item={items[index]}
          isSelectedForDelete={isSelected}
          handleSelectedForDelete={handleSelectedForDelete}
          handleMoreFromThisSite={handleMoreFromThisSite}
          handleDeleteSingleItem={handleDeleteSingleItem}
        />
      </div>
    );
  };

  Row.propTypes = {
    index: PropTypes.number.isRequired,
    style: PropTypes.shape({}).isRequired,
  };

  const title = moment(date).format('dddd, MMMM Do, Y');
  const showSubheader = settingsState.showResultsCount;
  const defaultSubheader = `${items.length.toLocaleString()} results`;
  const subheader = searchText.length > 0 ? `${defaultSubheader} for '${searchText}'` : defaultSubheader;

  return (
    <Grid
      container
      alignItems="center"
      direction="column"
      className={classes.historyListGrid}
    >
      <Card>
        <CardHeader
          title={title}
          subheader={showSubheader ? subheader : null}
          titleTypographyProps={{
            variant: 'h5',
          }}
          action={(
            <>
              <IconButton className={classes.menuIcon} size="large" aria-controls="history-list-menu" aria-label="options" aria-haspopup="true" onClick={handleMenuClick}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="history-list-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                TransitionComponent={Fade}
              >
                <MenuItem onClick={deleteEntireDay}>{`Delete ${items.length} items`}</MenuItem>
              </Menu>
            </>
          )}
        />
        <Divider variant="fullWidth" light />
        <CardContent>
          <List
            height={1000}
            itemCount={items.length}
            itemSize={50}
            width={950}
          >
            {Row}
          </List>
        </CardContent>
      </Card>
    </Grid>
  );
};

HistoryList.propTypes = {
  data: PropTypes.shape({
    date: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  getSelectedForDeleteIndex: PropTypes.func.isRequired,
  handleSelectedForDelete: PropTypes.func.isRequired,
  searchText: PropTypes.string.isRequired,
  handleMoreFromThisSite: PropTypes.func.isRequired,
  handleDeleteSingleItem: PropTypes.func.isRequired,
  forceUpdate: PropTypes.func.isRequired,
};

export default HistoryList;
