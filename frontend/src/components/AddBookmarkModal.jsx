import useBookmarkStore from "../store/useBookmarkStore";
import { useState } from "react";
import { Modal, TextInput, Group, Button, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";

const AddBookmarkModal = ({ opened, close }) => {
  const { addBookmark } = useBookmarkStore();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      title: "",
      url: "",
      description: "",
    },
    // Optional but awesome: built-in validation!
    validate: {
      title: (value) =>
        value.trim().length === 0 ? "Title is required" : null,
      url: (value) => (value.trim().length === 0 ? "URL is required" : null),
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    await addBookmark(values);
    form.reset(); // Mantine magic: clears the form instantly
    close();
    setLoading(false);
  };
  return (
    <Modal opened={opened} onClose={close} title="Add New Bookmark" centered>
      {/* Notice how form.onSubmit wraps your handler */}
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Title"
          placeholder="e.g. youtube"
          withAsterisk
          {...form.getInputProps("title")}
        />
        <TextInput
          label="Url"
          placeholder="e.g. www.youtube.com"
          withAsterisk
          {...form.getInputProps("url")}
        />
        <Textarea
          label="Description"
          placeholder="It's Youtube, what's to describe"
          {...form.getInputProps("description")}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default AddBookmarkModal;
