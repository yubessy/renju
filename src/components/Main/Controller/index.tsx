import {
  Box,
  Button, ButtonProps,
  Flex,
  Icon, IconButton,
  Menu, MenuButton, MenuDivider, MenuItem, MenuItemOption, MenuList, MenuOptionGroup,
  Text,
  useDisclosure,
} from '@chakra-ui/core'
import React, { FC, useContext } from 'react'
import {
  FiCamera,
  FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight,
  FiCircle,
  FiEdit,
  FiEdit2,
  FiInfo,
  FiLoader,
  FiMenu,
  FiMoreVertical,
  FiPlayCircle,
  FiToggleRight,
  FiTrash2,
  FiType,
  FiX
} from 'react-icons/fi'
import { AppState, EditMode } from '../../../state'
import { AppStateContext, SystemContext } from '../../contexts'
import AboutModal from './AboutModal'
import DownloadHidden, { onDownload } from './DownloadHidden'
import PreferenceModal from './PreferenceModal'

const Default: FC = () => {
  const system = useContext(SystemContext)
  const [appState, setAppState] = useContext(AppStateContext)
  return <Flex width={system.W} justifyContent="space-around" alignItems="center">
    <LeftMenu
      buttonSize={system.buttonSize}
    />
    <EditMenu
      buttonSize={system.buttonSize}
    />
    <Flex justifyContent="center" alignItems="center">
      <IconButton
        onClick={() => setAppState(appState.toStart())}
        icon={FiChevronsLeft} aria-label="to start"
        size={system.buttonSize}
        variant="ghost"
        isDisabled={appState.gameState.isStart}
      />
      <IconButton
        onClick={() => setAppState(appState.backward())}
        icon={FiChevronLeft} aria-label="backward"
        size={system.buttonSize}
        variant="ghost"
        isDisabled={appState.gameState.isStart}
      />
      <Button
        width={6} // do not resize according to text
        size={system.buttonSize}
        variant="ghost" fontFamily="Noto Serif" fontWeight="normal"
        isDisabled={true}
      >
        {appState.gameState.cursor}
      </Button>
      <IconButton
        onClick={() => setAppState(appState.forward())}
        icon={FiChevronRight} aria-label="forward"
        size={system.buttonSize}
        variant="ghost"
        isDisabled={appState.gameState.isLast}
      />
      <IconButton
        onClick={() => setAppState(appState.toLast())}
        icon={FiChevronsRight} aria-label="to last"
        size={system.buttonSize}
        variant="ghost"
        isDisabled={appState.gameState.isLast}
      />
    </Flex>
    <IconButton
      onClick={() => setAppState(appState.undo())}
      icon={FiX} aria-label="undo"
      size={system.buttonSize}
      variant="ghost"
      isDisabled={!appState.canUndo}
    />
    <RightMenu
      buttonSize={system.buttonSize}
    />
  </Flex>
}

type MenuProps = {
  buttonSize: ButtonProps['size']
}

const LeftMenu: FC<MenuProps> = ({
  buttonSize,
}) => {
  const preferenceDisclosure = useDisclosure()
  const aboutDisclosure = useDisclosure()
  return <>
    <Menu>
      <MenuButton as={Box}>
        <IconButton
          icon={FiMenu} aria-label="menu"
          size={buttonSize}
          variant="ghost"
        />
      </MenuButton>
      <MenuList>
        <MenuItem onClick={preferenceDisclosure.onOpen}>
          <Icon size="small" as={FiToggleRight} />
          <Text ml={2}>Preferences</Text>
        </MenuItem>
        <MenuDivider />
        <MenuItem onClick={aboutDisclosure.onOpen}>
          <Icon size="small" as={FiInfo} />
          <Text ml={2}>About</Text>
        </MenuItem>
      </MenuList>
    </Menu>
    <PreferenceModal isOpen={preferenceDisclosure.isOpen} onClose={preferenceDisclosure.onClose} />
    <AboutModal isOpen={aboutDisclosure.isOpen} onClose={aboutDisclosure.onClose} />
  </>
}

const EditMenu: FC<MenuProps> = ({
  buttonSize,
}) => {
  const [appState, setAppState] = useContext(AppStateContext)
  return <>
    <Menu>
      <MenuButton as={Box}>
        <IconButton
          icon={FiEdit}
          aria-label="edit"
          size={buttonSize}
          variant="ghost"
        />
      </MenuButton>
      <MenuList>
        <MenuOptionGroup defaultValue={appState.mode} title="Mode" type="radio" onChange={
          (value: any) => setAppState(appState.setMode(value as EditMode))
        }>
          <MenuItemOption value={EditMode.mainMoves}>
            <Flex alignItems="center">
              <Icon size="small" as={FiPlayCircle}/>
              <Text ml={2}>Main Moves</Text>
            </Flex>
          </MenuItemOption>
          <MenuDivider />
          <MenuItemOption value={EditMode.freeBlacks}>
            <Flex alignItems="center">
              <Icon size="small" as={FiCircle} fill="black" />
              <Text ml={2}>Put Free Blacks</Text>
            </Flex>
          </MenuItemOption>
          <MenuItemOption value={EditMode.freeWhites}>
            <Flex alignItems="center">
              <Icon size="small" as={FiCircle}/>
              <Text ml={2}>Put Free Whites</Text>
            </Flex>
          </MenuItemOption>
          <MenuDivider />
          <MenuItemOption value={EditMode.markerPoints}>
            <Flex alignItems="center">
              <Icon size="small" as={FiType}/>
              <Text ml={2}>Mark Points</Text>
            </Flex>
          </MenuItemOption>
          <MenuItemOption value={EditMode.markerLines}>
            <Flex alignItems="center">
              <Icon size="small" as={FiEdit2}/>
              <Text ml={2}>Mark Lines</Text>
            </Flex>
          </MenuItemOption>
        </MenuOptionGroup>
        <MenuDivider />
        <MenuItem onClick={() => setAppState(appState.resetFreeState())}>
          <Icon size="small" as={FiTrash2} />
          <Text ml={2}>Clear Free Stones</Text>
        </MenuItem>
        <MenuItem>
          <Icon size="small" as={FiTrash2} />
          <Text ml={2}>Clear Markers</Text>
        </MenuItem>
        <MenuItem
          onClick={
            () => {
              const message = 'Going to reset all moves, free stones and markers. Sure?'
              if (window.confirm(message)) setAppState(new AppState({}))
            }
          }>
          <Icon size="small" as={FiLoader} color="red.500" />
          <Text ml={2} color="red.500">Reset All</Text>
        </MenuItem>
      </MenuList>
    </Menu>
  </>
}

const RightMenu: FC<MenuProps> = ({
  buttonSize,
}) => {
  const downloadHiddenId = 'download-hidden'
  return <>
    <Menu>
      <MenuButton as={Box}>
        <IconButton
          icon={FiMoreVertical} aria-label="more"
          size={buttonSize}
          variant="ghost"
        />
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => onDownload(downloadHiddenId)}>
          <Icon size="small" as={FiCamera} />
          <Text ml={2}>Download Picture</Text>
        </MenuItem>
      </MenuList>
    </Menu>
    <DownloadHidden id={downloadHiddenId} />
  </>
}

export default Default
