import { useEffect, useState } from "react";
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  SimpleGrid,
  Card,
  Text,
  Button,
  Center,
  Title,
  TextInput,
  Menu,
} from "@mantine/core";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import useBookmarkStore from "../store/useBookmarkStore"; // Your Zustand store
import PageLoader from "../components/PageLoader";
import AddBookmarkModal from "../components/AddBookmarkModal";
import EditBookmarkModal from "../components/EditBookmarkModal";
import usePackageStore from "../store/usePackageStore";
import AddPackageModal from "../components/AddPackageModal";

const Dashboard = () => {
  // 1. Hook into your global state
  const { bookmarks, isLoading, fetchBookmarks, deleteBookmark } =
    useBookmarkStore();
  const {
    packages,
    fetchPackages,
    addBookmarkToPackage,
    packageBookmarks,
    getBookmarksFromPackage,
  } = usePackageStore();
  const [activePackage, setActivePackage] = useState(null);
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [
    packageModalOpened,
    { open: openPackageModal, close: closePackageModal },
  ] = useDisclosure(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchValue, 300); // 300ms delay

  // 2. Setup standard hooks
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure(); // For mobile sidebar toggling

  // 3. The Fetch Lifecycle
  useEffect(() => {
    fetchBookmarks(debouncedSearch);
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const handleLaunchAll = () => {
    packageBookmarks.forEach((bookmark) => {
      window.open(bookmark.url, '_blank');
    });
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      {/* --- TOP HEADER (Optional for Mobile) --- */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Text fw={700} size="lg">
            LaunchSpace
          </Text>
          <TextInput
            placeholder="Search bookmarks..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.currentTarget.value)}
            w={250}
          />
          <Button onClick={openModal}>Add Bookmark</Button>
        </Group>
      </AppShell.Header>

      {/* --- LEFT SIDEBAR --- */}
      <AppShell.Navbar p="md">
        {/* Navigation Links */}
        <AppShell.Section grow>
          <NavLink
            label="All Bookmarks"
            active={!activePackage}
            onClick={() => setActivePackage(null)}
          />

          <NavLink label="Packages" childrenOffset={28} defaultOpened>
            {/* 1. Show a message if they have no packages */}
            {packages.length === 0 && (
              <Text size="xs" c="dimmed" p="sm">
                No packages yet
              </Text>
            )}

            {/* 2. Map over the packages from your database */}
            {packages.map((pkg) => (
              <NavLink
                key={pkg.id}
                label={pkg.name}
                active={activePackage?.id === pkg.id}
                onClick={() => {
                  setActivePackage(pkg);
                  getBookmarksFromPackage(pkg.id); // Fetch the bookmarks for this package!
                }}
              />
            ))}

            {/* 3. A button to create a new package */}
            <Button
              variant="subtle"
              size="xs"
              mt="sm"
              fullWidth
              onClick={openPackageModal}
            >
              + New Package
            </Button>
          </NavLink>
        </AppShell.Section>

        {/* Bottom Profile / Logout */}
        <AppShell.Section>
          <Button variant="light" color="red" fullWidth onClick={handleLogout}>
            Logout
          </Button>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* --- MAIN CONTENT AREA --- */}
      <AddBookmarkModal close={closeModal} opened={modalOpened} />
      <EditBookmarkModal
        bookmark={editingBookmark}
        close={closeEditModal}
        opened={editModalOpened}
      />
      <AddPackageModal opened={packageModalOpened} close={closePackageModal} />
      <AppShell.Main bg="gray.0" className="flex justify-between">
        {isLoading ? (
          <PageLoader />
        ) : bookmarks.length === 0 ? (
          <Center maw={400} h={100} bg="var(--mantine-color-gray-light)">
            <Title order={2} c="dimmed">
              No bookmarks yet!
            </Title>
          </Center>
        ) : (<>
          {activePackage && (
            <Group justify="space-between" mb="lg">
            <Title order={2}>{activePackage.name}</Title>
            <Button onClick={handleLaunchAll} color="blue" size="md">
              Launch All 🚀
            </Button>
          </Group>
        )}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {(activePackage ? packageBookmarks : bookmarks).map((bookmark) => (
              <Card key={bookmark.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={500}>{bookmark.title}</Text>
                <Text size="sm" c="dimmed" lineClamp={2}>
                  {bookmark.description || "No description"}
                </Text>
                <Button
                  variant="outline"
                  color="gray"
                  onClick={() => {
                    setEditingBookmark(bookmark);
                    openEditModal();
                  }}
                  >
                  Edit
                </Button>

                {/* Add a button group for Launching and Deleting */}
                <Group mt="md">
                  <Button
                    variant="light"
                    color="blue"
                    component="a"
                    href={bookmark.url}
                    target="_blank"
                    >
                    Launch
                  </Button>
                  <Button
                    variant="outline"
                    color="red"
                    onClick={() => deleteBookmark(bookmark.id)}
                    >
                    Delete
                  </Button>
                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <Button variant="light" color="grape">
                        + Package
                      </Button>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Label>Select a Package</Menu.Label>

                      {/* If no packages exist, show a fallback */}
                      {packages.length === 0 && (
                        <Menu.Item disabled>No packages available</Menu.Item>
                      )}

                      {/* Map over the packages to create dropdown items */}
                      {packages.map((pkg) => (
                        <Menu.Item
                        key={pkg.id}
                        onClick={() =>
                          addBookmarkToPackage(pkg.id, bookmark.id)
                        }
                        >
                          {pkg.name}
                        </Menu.Item>
                      ))}
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </>
        )}
      </AppShell.Main>
    </AppShell>
  );
};

export default Dashboard;
