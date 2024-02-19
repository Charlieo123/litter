"use client";

import React from "react";
import clsx from "clsx";
import Link from "next/link";
import { PostBox, PostDisplay } from "../components/post-displays";
import { VariableSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import CreatePostForm from '../components/create-post-form';
import posts from "../../worker/data.jsonl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TrashIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";


const allPosts = Object.values(posts);

const postHeights = allPosts.map((post) => {
  let height = 128;
  if (post.text) {
    height += 64 + 32;
  }
  if (post.img_url) {
    height += 512;
  }
  return height;
});

const ListRow = ({ index, style }) => {
  const post = allPosts[index];
  return (
    <div style={style}>
      <PostBox className={"h-full"}>
        <PostDisplay
          {...post}
          username="anonymous"
          createdAt={new Date(parseFloat(post.createdAt)).toLocaleString()}
        />
      </PostBox>
    </div>
  );
};

export default function Bye() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts");
      return await res.json();
    },
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 10,
  });
  const { posts, cooldown } = data || { posts: [], cooldown: false };
  const createPost = async ({ text, encoded_img }) => {
    if (!(text || encoded_img)) return;
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, encoded_img }),
    });
    const json = await res.json();
    await queryClient.invalidateQueries(["posts"]);
    return json;
  };
  return (
    <div className="flex flex-col relative h-screen w-screen">
      <header
        className={clsx(
          "fixed top-0 w-screen h-[100px] bg-black border-b border-gray-500",
          "py-8 flex flex-row justify-center items-center gap-4"
        )}
      >

      <div >
      <CreatePostForm onSubmit={createPost}/>
      </div>

        <TrashIcon className="w-8 h-8" />
        <h1 className="text-4xl">Litter</h1>

      </header>
      <main className="mt-[100px] h-full">
        {allPosts && (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                itemCount={allPosts.length}
                itemSize={(index) => postHeights[index]}
                width={width}
              >
                {ListRow}
              </List>
            )}
          </AutoSizer>
        )}
      </main>
    </div>
  );
}
